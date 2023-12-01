import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './OAuth/google.strategy';
import { FacebookStrategy } from './OAuth/facebook.strategy';
import { TokensModule } from 'tokens/tokens.module';
import { UserTokenService } from './user-token.service';
import { SendEmailService } from './send-email.service';
const config = new ConfigService();

@Module({
  imports: [
    UsersModule,
    TokensModule,
    JwtModule.register({
      global: true,
      secret: config.get<string>('JWT_SECRET'),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserTokenService,
    SendEmailService,
    AuthGuard,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
