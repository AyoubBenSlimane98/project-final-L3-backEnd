import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AtGuard } from './authentication/common/guards';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

    app.setGlobalPrefix('api');

    const reflector = new Reflector();
    app.useGlobalGuards(new AtGuard(reflector));

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
  } catch (error) {
    console.error('❌ Error during application bootstrap:', error);
    process.exit(1);
  }
}
void bootstrap();
