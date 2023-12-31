import { AuthGuard } from './auth.guard';
import { UsersService } from './../users/users.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import CreateUserRequest, { SignInRequest } from 'src/users/users.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';
import { Public } from 'src/auth/public-route.decorator';
import { ConfigService } from '@nestjs/config';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private auth: AuthGuard,
    private config: ConfigService,
  ) {}

  @Post('/sign-up')
  async signUp(@Body() request: CreateUserRequest, @Res() res: Response) {
    const result = await this.authService.signUp(request);
    return res
      .status(201)
      .json({ message: 'Sign up successfully', data: result });
  }

  @Post('/sign-in')
  async signIn(@Body() request: SignInRequest, @Res() res: Response) {
    const result = await this.authService.signIn(request);

    return res.status(200).json({
      message: 'Sign in successfully',
      data: result,
    });
  }

  @Post('/refresh-token/refresh')
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const result = await this.authService.refreshToken(refreshToken);
    return res
      .status(200)
      .json({ message: 'Refresh token successfully', data: result });
  }

  @Post('/refresh-token/sign-out')
  async signOut(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    const refreshToken = body.refresh_token;
    await this.authService.signOut(refreshToken);

    return res.status(200).json({
      message: 'Sign out successfully',
      data: {},
    });
  }

  @Get('/test')
  @HttpCode(200)
  testGuard() {
    return {
      message: 'Test reponse',
      data: { hehe: 'hehe' },
    };
  }
}
