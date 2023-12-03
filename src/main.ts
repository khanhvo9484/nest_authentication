import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
declare const module: any;
async function bootstrap() {
  const logger = new MyLogger();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.enableCors({
    origin: ['https://classroom.k3unicorn.tech', 'http://localhost:4000'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });
  const config = new ConfigService();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  await app.listen(config.get<number>('PORT'));
  logger.log('App server start at port: ');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
