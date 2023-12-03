import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IAuthUser } from '../auth.interface';
import { AuthService } from '../auth.service';
import { Profile, Strategy, VerifyCallback } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: config.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user: IAuthUser = {
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      avatar: photos[0].value,
      password: '',
      isVerified: true,
    };

    const authUser = await this.authService.validateUser(user);

    console.log(
      'URL FACEBOOK: ',
      this.config.get<string>('FACEBOOK_CALLBACK_URL'),
    );
    done(null, authUser);
  }
}
