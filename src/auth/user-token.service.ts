import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { TokensService } from 'tokens/tokens.service';

export enum TokenType {
  ACTIVATE_ACCOUNT = 'activate_account',
  RESET_PASSWORD = 'reset_password',
}
export type TokenPayload = {
  email: string;
  subject: TokenType;
};
@Injectable()
export class UserTokenService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async createUserToken(payload: TokenPayload, userId: number) {
    const token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_TOKEN_SECRET'),
    });
    const result = await this.tokensService.createToken({
      token,
      isUsed: false,
      user: { connect: { id: userId } },
    });
    return token;
  }

  async verifyUserToken(email: string, token: string, subject: TokenType) {
    if (!email || !token) {
      throw new BadRequestException('Empty email or token');
    }
    const storedToken = await this.tokensService.findToken(token);
    if (!storedToken) {
      throw new BadRequestException('Token not found');
    }
    if (storedToken.isUsed) {
      throw new BadRequestException('Token is already used');
    }
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_TOKEN_SECRET'),
      });
    } catch (err) {
      throw new BadRequestException('Invalid token');
    }
    if (!payload.email || payload.email !== email) {
      throw new BadRequestException('Invalid token');
    }
    if (payload.subject !== subject) {
      throw new BadRequestException('Invalid token');
    }
    return true;
  }
}
