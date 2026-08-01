import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';
import { Premium } from '../models/Premium';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { env } from '../config/env';

export class PremiumController {
  async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          plans: [
            { id: 'monthly', name: 'Monthly', price: env.PREMIUM_PRICE_MONTHLY, interval: 'month' },
            { id: 'yearly', name: 'Yearly', price: env.PREMIUM_PRICE_YEARLY, interval: 'year' },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id).select('premiumUntil');
      const premium = await Premium.findOne({ user: req.user!.id, status: 'active' });
      const isPremium = user?.premiumUntil && user.premiumUntil > new Date();
      res.json({
        success: true,
        data: { isPremium, premiumUntil: user?.premiumUntil, subscription: premium },
      });
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = req.body.plan as 'monthly' | 'yearly';
      const amount = plan === 'yearly' ? env.PREMIUM_PRICE_YEARLY : env.PREMIUM_PRICE_MONTHLY;
      const months = plan === 'yearly' ? 12 : 1;

      const payment = await Payment.create({
        user: req.user!.id,
        amount,
        status: 'completed',
        provider: 'manual',
        type: 'premium',
        metadata: { plan },
      });

      const startDate = new Date();
      const endDate = dayjs().add(months, 'month').toDate();

      const premium = await Premium.create({
        user: req.user!.id,
        plan,
        status: 'active',
        startDate,
        endDate,
        paymentId: payment._id,
      });

      await User.updateOne({ _id: req.user!.id }, { premiumUntil: endDate });

      res.status(201).json({ success: true, data: { premium, payment }, message: 'Premium activated' });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const premium = await Premium.findOneAndUpdate(
        { user: req.user!.id, status: 'active' },
        { status: 'cancelled', autoRenew: false },
        { new: true }
      );
      res.json({ success: true, data: premium, message: 'Premium cancelled' });
    } catch (error) {
      next(error);
    }
  }
}

export const premiumController = new PremiumController();
