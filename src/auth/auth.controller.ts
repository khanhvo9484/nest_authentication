import { AuthGuard } from './auth.guard';
import { UsersService } from './../users/users.service';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { validateOrReject, validate } from 'class-validator';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import CreateUserRequest, { SignInRequest } from 'src/users/users.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private auth: AuthGuard,
  ) {}
  @Post('/sign-up')
  async signUp(@Body() request: CreateUserRequest, @Res() res: Response) {
    const result = await this.authService.signUp(request);
    return res.status(200).json(result);
  }

  @Post('/sign-in')
  async signIn(@Body() request: SignInRequest, @Res() res: Response) {
    const result = await this.authService.signIn(request);
    const refreshToken = result[1];
    const response = result[0];

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/auth/refresh-token',
      sameSite: 'none',
      expires: new Date(new Date().getTime() + 60 * 1000 * 60),
    });

    return res.status(200).json(response);
  }

  @Post('/refresh-token/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const result = await this.authService.refreshToken(refreshToken);
    const response = result[0];
    const newRefreshToken = result[1];

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      path: '/auth/refresh-token',
      sameSite: 'none',
      expires: new Date(new Date().getTime() + 60 * 1000 * 60),
    });

    return res.status(200).json(response);
  }
  @Post('/refresh-token/sign-out')
  async signOut(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ) {
    await this.authService.signOut(body);

    res.clearCookie('refresh_token', {
      httpOnly: true,
      path: '/auth/refresh-token',
      sameSite: 'none',
    });

    return res.status(200).json({
      message: 'Sign out successfully',
    });
  }

  @UseGuards(AuthGuard)
  @Get('/test-guard')
  testGuard() {
    return 'Test guard';
  }
}
