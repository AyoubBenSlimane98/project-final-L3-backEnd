import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { CodeOtpService } from 'src/code-otp/code-otp.service';
import { AuthenticationService } from './authentication.service';
import { AtStrategy, RtStrategy } from './strategyes';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    PrismaService,
    EmailService,
    CodeOtpService,
    AuthenticationService,
    AtStrategy,
    RtStrategy,
    JwtService,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
