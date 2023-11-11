import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLogger } from './logger/logger.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import configuration from './config/configuration';
@Module({
  imports: [LoggerModule, ConfigModule.forRoot({
    load:[configuration],
    isGlobal: true
  }), AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, MyLogger, PrismaService],
})
export class AppModule {}
