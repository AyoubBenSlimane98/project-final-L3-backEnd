import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateOTP } from 'src/util';

@Injectable()
export class CodeOtpService {
  constructor(private readonly prisma: PrismaService) {}
  async storeOTP(email: string) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const compte = await this.prisma.compte.findUnique({
      where: { email },
    });
    if (!compte) {
      return otp;
    }
    await this.prisma.codeOTP.upsert({
      where: {
        compteId: compte.id,
      },
      update: {
        code: otp,
        expiresAt: expiresAt,
      },
      create: {
        code: otp,
        expiresAt: expiresAt,
        compte: {
          connect: {
            id: compte.id,
          },
        },
      },
    });
    return otp;
  }

  async verifyOTP(email: string, otp: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { email },
    });
    if (!compte) {
      throw new ForbiddenException('Email not found');
    }
    const otpRecord = await this.prisma.codeOTP.findFirst({
      where: {
        compteId: compte.id,
        code: otp,
      },
    });
    if (!otpRecord) return { valid: false, message: 'Invalid OTP' };
    const isExpired = otpRecord.expiresAt < new Date();
    if (isExpired) {
      await this.prisma.codeOTP.delete({
        where: {
          id: otpRecord.id,
        },
      });
      return false;
    }
    await this.prisma.codeOTP.delete({
      where: {
        id: otpRecord.id,
      },
    });
    return { valid: true, message: 'OTP verified successfully' };
  }
}
