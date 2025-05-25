import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { CodeOtpModule } from './code-otp/code-otp.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AdminModule } from './admin/admin.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PrincipalModule } from './principal/principal.module';
import { ResponsableModule } from './responsable/responsable.module';
import { EncryptionModule } from './encryption/encryption.module';
import { TokenModule } from './token/token.module';
import { EutdaintModule } from './eutdaint/eutdaint.module';
import { LoggerMiddleware } from './eutdaint/Middleware/logger.middleware';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    CodeOtpModule,
    AuthenticationModule,
    AdminModule,
    FileUploadModule,
    PrincipalModule,
    ResponsableModule,
    EncryptionModule,
    TokenModule,
    EutdaintModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
