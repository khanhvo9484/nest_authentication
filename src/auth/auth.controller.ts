import { AuthGuard } from './auth.guard';
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
import CreateUserRequest, { SignInRequest } from '@users/users.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';
import { Public } from '@auth/public-route.decorator';
import { ConfigService } from '@nestjs/config';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport/dist';
import { SendEmailService } from './send-email.service';
import { SUCCESS_PAGE_URL } from 'constant/common.constant';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailSender: SendEmailService,
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

  @Post('/verify-email')
  async verifyEmail(
    @Body() request: { token: string; email: string },
    @Res() res: Response,
  ) {
    const { token, email } = request;
    const result = await this.authService.activateAccount(email, token);

    return res
      .status(200)
      .json({ message: 'Verify email successfully', data: result });
  }

  @Post('/forgot-password')
  async forgotPassword(
    @Body() request: { email: string },
    @Res() res: Response,
  ) {
    const { email } = request;
    const result = await this.authService.forgotPassword(email);

    return res
      .status(200)
      .json({ message: 'Reset password successfully', data: result });
  }

  @Post('/verify-reset-password')
  async verifyResetPassword(
    @Body() request: { token: string; email: string },
    @Res() res: Response,
  ) {
    const { token, email } = request;
    const result = await this.authService.verifyResetPassword(email, token);

    return res
      .status(200)
      .json({ message: 'Verify reset password successfully', data: result });
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() request: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = request;
    const result = await this.authService.resetPassword(email, password);

    return res
      .status(200)
      .json({ message: 'Reset password successfully', data: result });
  }
  @Post('/sign-in')
  async signIn(@Body() request: SignInRequest, @Res() res: Response) {
    const result = await this.authService.logIn(request);

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

  @Get('google')
  @UseGuards(AuthGuardPassport('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuardPassport('google'))
  async googleAuthCallback(@Req() request, @Res() response: Response) {
    const user = request.user;
    const data = await this.authService.authLogin(user);
    const url_redirect = this.config.get('FRONTEND_URL') + SUCCESS_PAGE_URL;

    response.cookie('payload', JSON.stringify(data), {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      domain: 'k3unicorn.tech',
      maxAge: 60000,
    });
    response.redirect(url_redirect);
  }

  @Get('facebook')
  @UseGuards(AuthGuardPassport('facebook'))
  async facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuardPassport('facebook'))
  async facebookAuthCallback(@Req() request, @Res() response: Response) {
    const user = request.user;
    const data = await this.authService.authLogin(user);
    const url_redirect = this.config.get('FRONTEND_URL') + SUCCESS_PAGE_URL;

    response.cookie('payload', JSON.stringify(data), {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    response.redirect(url_redirect);
  }

  @Get('/test')
  @HttpCode(200)
  testGuard() {
    return {
      message: 'Test reponse',
      data: { hehe: 'hehe' },
    };
  }

  @Get('/send-test-email')
  async sendTestEmail() {
    await this.emailSender.sendTestEmail('khanhvogpt2@gmail.com');
    return {
      message: 'Send test email successfully',
    };
  }
}
