import { Module } from '@nestjs/common';
import { EutdaintController } from './eutdaint.controller';
import { EutdaintService } from './eutdaint.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  exports: [],
  controllers: [EutdaintController],
  providers: [EutdaintService, PrismaService],
})
export class EutdaintModule {}
