import nodemailer from 'nodemailer';
import { env } from '../config/env';
import winston from 'winston';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [new winston.transports.Console()],
});

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (!env.SMTP_HOST) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
    }
    return this.transporter;
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = this.getTransporter();
    const subject = 'Verify your EYEBOX TUBE.AI account';
    const html = `
      <h2>EYEBOX TUBE.AI</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p>
    `;

    if (!transporter) {
      logger.info(`[DEV] OTP for ${email}: ${otp}`);
      return;
    }

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    const transporter = this.getTransporter();
    const subject = 'Reset your EYEBOX TUBE.AI password';
    const html = `
      <h2>EYEBOX TUBE.AI</h2>
      <p>Your password reset code is: <strong>${otp}</strong></p>
      <p>This code expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p>
    `;

    if (!transporter) {
      logger.info(`[DEV] Password reset OTP for ${email}: ${otp}`);
      return;
    }

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) return;

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Welcome to EYEBOX TUBE.AI!',
      html: `<h2>Welcome, ${name}!</h2><p>Start watching and creating amazing content.</p>`,
    });
  }
}

export const emailService = new EmailService();
