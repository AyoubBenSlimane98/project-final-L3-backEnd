import { Module } from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { PrincipalController } from './principal.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [EncryptionModule, TokenModule],
  providers: [PrincipalService, PrismaService],
  controllers: [PrincipalController],
})
export class PrincipalModule {}
