import { Module } from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { ResponsableController } from './responsable.controller';

import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ResponsableService, PrismaService],
  controllers: [ResponsableController],
})
export class ResponsableModule {}
