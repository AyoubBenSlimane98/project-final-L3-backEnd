import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { CodeOtpModule } from './code-otp/code-otp.module';
import { AuthenticationModule } from './authentication/authentication.module';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    CodeOtpModule,
    AuthenticationModule,
    JwtModule.register({}),
  ],
  providers: [],
})
export class AppModule {}
