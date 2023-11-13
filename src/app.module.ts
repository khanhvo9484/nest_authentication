import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLogger } from './logger/logger.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration';
import { HttpExceptionFilter } from './exception-filter/http-exception.filter';
import { RedisModule } from './redis/redis.module';
import { ProtectedService } from './protected/protected.service';
import { ProtectedController } from './protected/protected.controller';
import { ProtectedModule } from './protected/protected.module';
import { RolesModule } from './role-guard/role.module';
import { AuthGuard } from './auth/auth.guard';
@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    RedisModule,
    PrismaModule,
    ProtectedModule,
    RolesModule,
  ],
  controllers: [AppController, ProtectedController],
  providers: [
    AppService,
    MyLogger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    ProtectedService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
