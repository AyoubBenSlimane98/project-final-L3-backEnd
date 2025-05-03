import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error(
        'SENDGRID_API_KEY is not defined in environment variables',
      );
    }
    sgMail.setApiKey(apiKey);
  }
  async sendOTPEmail(email: string, otp: string) {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error(
        'SENDGRID_FROM_EMAIL is not defined in environment variables',
      );
    }
    const msg = {
      to: email,
      from: `Programmer Ayyoub  <${fromEmail}`,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
      html: `<strong>Your OTP code is ${otp}</strong> , it is valid for 10 minutes. Please do not share this code with anyone.`,
    };

    try {
      await sgMail.send(msg);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
