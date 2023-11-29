import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
declare const module: any;
async function bootstrap() {
  const logger = new MyLogger();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.enableCors({
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });
  const config = new ConfigService();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());
  app.use(passport.initialize());
  app.setGlobalPrefix('api/v1');
  await app.listen(config.get<number>('PORT'));
  logger.log('App server start at port: ');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
