import { plainToClass } from 'class-transformer';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import CreateUserRequest, {
  SignInRequest,
  UserResponse,
} from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
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
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private config: ConfigService,
  ) {}

  generateToken(payload: payloadType, tokenType: string) {
    if (tokenType === 'access_token') {
      return this.jwtService.sign(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRATION_TIME'),
      });
    }
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });
  }

  async signUp(request: CreateUserRequest) {
    const password = request.password;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    request.password = hashPassword;

    const result = await this.usersService.createUser(request);
    const userResponse = plainToClass(UserResponse, result);
    return userResponse;
  }

  async signIn(request: SignInRequest) {
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

    const payload: payloadType = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    let token: string = await this.cache.get('access_token_' + user.email);
    if (!token) {
      token = this.generateToken(payload, 'access_token');
      await this.cache.set('access_token_' + user.email, token, {
        ttl: 3600,
      });
    }

    let refreshToken: string = await this.cache.get(
      'refresh_token_' + user.email,
    );
    if (!refreshToken) {
      refreshToken = this.generateToken(payload, 'refresh_token');

      await this.cache.set('refresh_token_' + user.email, refreshToken, {
        ttl: 3600 * 24 * 7,
      });
    }

    const userResponse = plainToClass(UserResponse, user);
    return [
      {
        access_token: token,
        user: userResponse,
      },
      refreshToken,
    ];
  }
  async refreshToken(refreshToken: string) {
    let payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

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

    await this.cache.del('access_token_' + email);
    await this.cache.del('refresh_token_' + email);
    payload = {
      id: payload['id'],
      email: payload['email'],
      name: payload['name'],
      role: payload['role'],
    };

    const newRefreshToken = this.generateToken(payload, 'refresh_token');
    const newAccessToken = this.generateToken(payload, 'access_token');

    await this.cache.set('access_token_' + email, newAccessToken, {
      ttl: 3600,
    });
    await this.cache.set('refresh_token_' + email, newRefreshToken, {
      ttl: 3600 * 24 * 7,
    });
    return [
      {
        access_token: newAccessToken,
      },
      newRefreshToken,
    ];
  }
  async signOut(body) {
    if (!body.email) {
      throw new BadRequestException('Invalid email');
    }
    await this.cache.del('access_token_' + body.email);
    await this.cache.del('refresh_token_' + body.email);
  }
}
