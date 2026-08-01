import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../models/User';
import { Channel } from '../models/Channel';
import { hashPassword, comparePassword, hashToken, compareToken } from '../utils/password';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { createHandle } from '../utils/slug';
import { generateOtp, storeOtp, verifyStoredOtp } from '../utils/otp';
import { emailService } from './email.service';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { env } from '../config/env';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
  deviceName?: string;
  userAgent?: string;
  ip?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await hashPassword(input.password);
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role: 'creator',
    });

    const handle = createHandle(input.name);
    await Channel.create({
      owner: user._id,
      name: input.name,
      handle,
      description: `Welcome to ${input.name}'s channel`,
    });

    const otp = generateOtp();
    await storeOtp(input.email, otp);
    await emailService.sendOtpEmail(input.email, otp);

    const tokens = await this.createSession(user, {
      deviceName: 'Registration Device',
      userAgent: '',
      ip: '',
    });

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid credentials');
    if (user.banned) throw new UnauthorizedError('Account banned');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const tokens = await this.createSession(user, {
      deviceName: input.deviceName || 'Unknown Device',
      userAgent: input.userAgent || '',
      ip: input.ip || '',
    });

    return { user, tokens };
  }

  async createSession(
    user: IUser,
    device: { deviceName: string; userAgent: string; ip: string }
  ): Promise<TokenPair> {
    const deviceId = uuidv4();
    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId,
    });
    const refreshTokenHash = await hashToken(refreshToken);

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId,
    });

    user.devices.push({
      deviceId,
      name: device.deviceName,
      userAgent: device.userAgent,
      ip: device.ip,
      lastActive: new Date(),
      refreshTokenHash,
    });

    if (user.devices.length > 10) {
      user.devices = user.devices.slice(-10);
    }

    await user.save();
    return { accessToken, refreshToken, deviceId };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.sub);
    if (!user || user.banned) throw new UnauthorizedError('User not found');

    const device = user.devices.find((d) => d.deviceId === payload.deviceId);
    if (!device) throw new UnauthorizedError('Device not found');

    const valid = await compareToken(refreshToken, device.refreshTokenHash);
    if (!valid) throw new UnauthorizedError('Invalid refresh token');

    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId: device.deviceId,
    });
    device.refreshTokenHash = await hashToken(newRefreshToken);
    device.lastActive = new Date();
    await user.save();

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId: device.deviceId,
    });

    return { accessToken, refreshToken: newRefreshToken, deviceId: device.deviceId };
  }

  async logout(userId: string, deviceId?: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    if (deviceId) {
      user.devices = user.devices.filter((d) => d.deviceId !== deviceId);
    } else {
      user.devices = [];
    }
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User not found');

    const otp = generateOtp();
    await storeOtp(email, otp);
    await emailService.sendPasswordResetEmail(email, otp);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const valid = await verifyStoredOtp(email, otp);
    if (!valid) throw new ValidationError('Invalid or expired OTP');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User not found');

    user.passwordHash = await hashPassword(newPassword);
    user.devices = [];
    await user.save();
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    const valid = await verifyStoredOtp(email, otp);
    if (!valid) throw new ValidationError('Invalid or expired OTP');

    await User.updateOne({ email: email.toLowerCase() }, { isEmailVerified: true });
  }

  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User not found');

    const otp = generateOtp();
    await storeOtp(email, otp);
    await emailService.sendOtpEmail(email, otp);
  }

  async findOrCreateGoogleUser(profile: {
    id: string;
    email: string;
    displayName: string;
    photos?: { value: string }[];
  }): Promise<{ user: IUser; tokens: TokenPair; isNew: boolean }> {
    let user = await User.findOne({ googleId: profile.id });
    let isNew = false;

    if (!user) {
      user = await User.findOne({ email: profile.email.toLowerCase() });
      if (user) {
        user.googleId = profile.id;
        user.isEmailVerified = true;
        await user.save();
      } else {
        isNew = true;
        user = await User.create({
          email: profile.email.toLowerCase(),
          name: profile.displayName,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value,
          role: 'creator',
          isEmailVerified: true,
        });
        await Channel.create({
          owner: user._id,
          name: profile.displayName,
          handle: createHandle(profile.displayName),
        });
      }
    }

    const tokens = await this.createSession(user, {
      deviceName: 'Google OAuth',
      userAgent: 'OAuth',
      ip: '',
    });

    return { user, tokens, isNew };
  }

  async getDevices(userId: string) {
    const user = await User.findById(userId).select('devices');
    if (!user) throw new NotFoundError('User not found');
    return user.devices.map((d) => ({
      deviceId: d.deviceId,
      name: d.name,
      userAgent: d.userAgent,
      ip: d.ip,
      lastActive: d.lastActive,
    }));
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    user.devices = user.devices.filter((d) => d.deviceId !== deviceId);
    await user.save();
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).select('-passwordHash -devices.refreshTokenHash -otp');
    if (!user) throw new NotFoundError('User not found');
    const channel = await Channel.findOne({ owner: userId });
    return { user, channel };
  }
}

export const authService = new AuthService();
