import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [EncryptionModule, TokenModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, JwtService],
})
export class AdminModule {}
