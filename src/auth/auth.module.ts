import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './utils/google.strategy';
import { Serializer } from './utils/serializer';
const config = new ConfigService();

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: config.get<string>('JWT_SECRET'),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, GoogleStrategy, Serializer],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
