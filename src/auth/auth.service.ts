import { plainToClass } from 'class-transformer';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import CreateUserRequest, {
  SignInRequest,
  UserResponse,
} from '@users/users.dto';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { IAuthUser } from './auth.interface';
import { User, UserToken } from '@prisma/client';
import { TokensService } from 'tokens/tokens.service';
import { TokenType, UserTokenService } from './user-token.service';
import { SendEmailService } from './send-email.service';

type payloadType = {
  id: number;
  email: string;
  name: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private config: ConfigService,
    private userTokenService: UserTokenService,
    private sendEmailService: SendEmailService,
  ) {}

  generateToken(payload: payloadType, tokenType: string) {
    if (tokenType === 'access_token') {
      return this.jwtService.sign(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: parseInt(this.config.get<string>('JWT_EXPIRATION_TIME')),
      });
    }
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: parseInt(
        this.config.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
      ),
    });
  }

  async setTokenToCache(token: string, email: string, tokenType: string) {
    if (tokenType === 'access_token') {
      await this.cache.set('access_token_' + email, token, {
        ttl: parseInt(this.config.get('JWT_EXPIRATION_TIME')),
      });
    } else {
      await this.cache.set('refresh_token_' + email, token, {
        ttl: parseInt(this.config.get('JWT_REFRESH_EXPIRATION_TIME')),
      });
    }
  }

  async signUp(request: CreateUserRequest) {
    const password = request.password;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    request.password = hashPassword;

    const result = await this.usersService.createUser(request);
    const verificationToken = await this.userTokenService.createUserToken(
      {
        email: result.email,
        subject: TokenType.ACTIVATE_ACCOUNT,
      },
      result.id,
    );

    const sendResult = await this.sendEmailService.sendVerificationEmail(
      result.email,
      verificationToken,
    );

    const userResponse = plainToClass(UserResponse, result);
    return userResponse;
  }

  async activateAccount(email: string, token: string) {
    await this.userTokenService.verifyUserToken(
      email,
      token,
      TokenType.ACTIVATE_ACCOUNT,
    );
    await this.usersService.updateUser({
      where: { email },
      data: { isVerified: true },
    });
    await this.tokensService.setTokenUsed(token);
    return {
      message: 'Account activated successfully',
    };
  }

  // send reset password email ----------------------------------------------
  async forgotPassword(email: string) {
    const user = await this.usersService.findUser({
      email: email,
    });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    const resetPasswordToken = await this.userTokenService.createUserToken(
      {
        email: user.email,
        subject: TokenType.RESET_PASSWORD,
      },
      user.id,
    );
    await this.sendEmailService.sendResetPasswordEmail(
      email,
      resetPasswordToken,
    );
    return {
      resetPasswordToken: resetPasswordToken,
    };
  }
  // end send reset password email ----------------------------------------------

  // verify reset password ----------------------------------------------
  async verifyResetPassword(email: string, token: string) {
    await this.userTokenService.verifyUserToken(
      email,
      token,
      TokenType.RESET_PASSWORD,
    );
    return {
      message: 'Verify reset password successfully',
    };
  }
  // end verify reset password ----------------------------------------------

  // reset password ----------------------------------------------
  async resetPassword(email: string, password: string) {
    if (!password) throw new BadRequestException('Password is required');
    if (!email) throw new BadRequestException('Email is required');

    const user = await this.usersService.findUser({
      email: email,
    });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    await this.usersService.updateUser({
      where: { email },
      data: { password: hashPassword },
    });
    return {
      message: 'Reset password successfully',
    };
  }

  // reset password ----------------------------------------------

  async logIn(request: SignInRequest) {
    const user = await this.usersService.findUser({
      email: request.email,
    });
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const match = await bcrypt.compare(request.password, user.password);
    if (!match) {
      throw new BadRequestException('Invalid email or password');
    }
    if (user.isVerified === false) {
      throw new BadRequestException('Please verify your email');
    }

    const payload: payloadType = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    let token: string = await this.cache.get('access_token_' + user.email);
    if (!token) {
      token = this.generateToken(payload, 'access_token');
      await this.setTokenToCache(token, user.email, 'access_token');
    }

    let refreshToken: string = await this.cache.get(
      'refresh_token_' + user.email,
    );
    if (!refreshToken) {
      refreshToken = this.generateToken(payload, 'refresh_token');

      await this.setTokenToCache(refreshToken, user.email, 'refresh_token');
    }

    const userResponse = plainToClass(UserResponse, user);
    return {
      access_token: token,
      user: userResponse,
      refresh_token: refreshToken,
    };
  }
  async refreshToken(refreshToken: string) {
    let payload: payloadType;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      throw new BadRequestException('Invalid refresh token');
    }

    const email = payload['email'];
    if (!email) {
      throw new BadRequestException('Invalid refresh token 1');
    }
    const inStorageToken = await this.cache.get('refresh_token_' + email);
    if (!inStorageToken) {
      throw new BadRequestException('Invalid refresh token 2');
    }
    if (inStorageToken !== refreshToken) {
      throw new BadRequestException('Invalid refresh token 3');
    }

    payload = {
      id: payload['id'],
      email: payload['email'],
      name: payload['name'],
      role: payload['role'],
    };

    const newRefreshToken = this.generateToken(payload, 'refresh_token');
    const newAccessToken = this.generateToken(payload, 'access_token');

    await this.setTokenToCache(newAccessToken, email, 'access_token');
    await this.setTokenToCache(newRefreshToken, email, 'refresh_token');
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async signOut(refreshToken: string): Promise<boolean> {
    const payload: payloadType = this.jwtService.verify(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
    if (!payload.email) {
      throw new BadRequestException('Invalid refresh token');
    }
    const email: string = payload.email;
    await this.cache.del('access_token_' + email);
    await this.cache.del('refresh_token_' + email);
    return true;
  }

  async validateUser(authUser: IAuthUser) {
    const user = await this.usersService.findUser({
      email: authUser.email,
    });

    if (user) return user;

    const newUser = await this.usersService.createUser(authUser);

    return newUser;
  }

  async authLogin(user: User) {
    const payload: payloadType = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    let token: string = await this.cache.get('access_token_' + user.email);
    if (!token) {
      token = this.generateToken(payload, 'access_token');
      await this.setTokenToCache(token, user.email, 'access_token');
    }

    let refreshToken: string = await this.cache.get(
      'refresh_token_' + user.email,
    );
    if (!refreshToken) {
      refreshToken = this.generateToken(payload, 'refresh_token');
      await this.setTokenToCache(refreshToken, user.email, 'refresh_token');
    }

    const userResponse = plainToClass(UserResponse, user);

    return {
      access_token: token,
      user: userResponse,
      refresh_token: refreshToken,
    };
  }

  async verifyLoginByUserID(userId: string) {
    const key = 'user_oauth_' + userId;
    const dataCache = await this.cache.get(key);
    await this.cache.del(key);

    return dataCache ? dataCache : '';
  }
}
