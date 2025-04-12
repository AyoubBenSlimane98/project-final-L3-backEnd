import { Module } from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { PrincipalController } from './principal.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrincipalService, PrismaService],
  controllers: [PrincipalController],
})
export class PrincipalModule {}
