import { Module } from '@nestjs/common';
import { CodeOtpService } from './code-otp.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CodeOtpService, PrismaService],
  exports: [CodeOtpService],
})
export class CodeOtpModule {}
