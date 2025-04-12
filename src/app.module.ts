import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { CodeOtpModule } from './code-otp/code-otp.module';
import { AuthenticationModule } from './authentication/authentication.module';

import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PrincipalModule } from './principal/principal.module';
import { ResponsableModule } from './responsable/responsable.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    CodeOtpModule,
    AuthenticationModule,
    JwtModule.register({}),
    AdminModule,
    FileUploadModule,
    PrincipalModule,
    ResponsableModule,
  ],
  providers: [],
})
export class AppModule {}
