import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { getParam } from '../utils/params';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const { user, tokens } = await authService.register({ email, password, name });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.status(201).json({
        success: true,
        data: { user: { id: user._id, email: user.email, name: user.name, role: user.role }, tokens },
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, deviceName } = req.body;
      const { user, tokens } = await authService.login({
        email,
        password,
        deviceName,
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip,
      });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json({
        success: true,
        data: { user: { id: user._id, email: user.email, name: user.name, role: user.role }, tokens },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.id, req.deviceId);
      clearAuthCookies(res);
      res.json({ success: true, message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const tokens = await authService.refreshTokens(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json({ success: true, data: { tokens }, message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ success: true, message: 'Reset code sent if account exists' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      await authService.resetPassword(email, otp, newPassword);
      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyOtp(req.body.email, req.body.otp);
      res.json({ success: true, message: 'Email verified' });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resendOtp(req.body.email);
      res.json({ success: true, message: 'OTP resent' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.getMe(req.user!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await authService.getDevices(req.user!.id);
      res.json({ success: true, data: devices });
    } catch (error) {
      next(error);
    }
  }

  async removeDevice(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.removeDevice(req.user!.id, getParam(req, 'deviceId'));
      res.json({ success: true, message: 'Device removed' });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = req.user as unknown as {
        id: string;
        emails: { value: string }[];
        displayName: string;
        photos?: { value: string }[];
      };
      const { user, tokens } = await authService.findOrCreateGoogleUser({
        id: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        photos: profile.photos,
      });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.redirect(`${env.APP_URL}/auth/callback?success=true`);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
