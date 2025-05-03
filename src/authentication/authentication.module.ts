import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { CodeOtpService } from 'src/code-otp/code-otp.service';
import { AuthenticationService } from './authentication.service';
import { AtStrategy, RtStrategy } from './strategyes';
import { JwtService } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  imports: [TokenModule, EncryptionModule],
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
