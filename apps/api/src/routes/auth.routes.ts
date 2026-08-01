import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, sanitizeBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../config/env';

const router = Router();

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile as unknown as Express.User);
      }
    )
  );
}

router.post(
  '/register',
  authLimiter,
  sanitizeBody,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().isLength({ min: 2 }),
  ]),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  sanitizeBody,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authLimiter, authController.refresh);

router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 4 }),
    body('newPassword').isLength({ min: 8 }),
  ]),
  authController.resetPassword
);

router.post(
  '/verify-otp',
  validate([body('email').isEmail(), body('otp').notEmpty()]),
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  authController.resendOtp
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.APP_URL}/auth/error` }),
  authController.googleCallback
);

router.get('/me', authenticate, authController.me);
router.get('/devices', authenticate, authController.getDevices);
router.delete('/devices/:deviceId', authenticate, authController.removeDevice);

export default router;
