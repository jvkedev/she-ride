import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('JWT_ACCESS_SECRET:', env.JWT_ACCESS_SECRET ? 'SET' : 'MISSING');

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(env.PORT);
}

void bootstrap();
