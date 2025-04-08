import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected to the database');
    } catch (error) {
      console.error('Error connecting to Prisma to database :', error);
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from the database');
  }
}
