import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AtGuard } from './authentication/common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const reflector = new Reflector();
  app.useGlobalGuards(new AtGuard(reflector));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
});
