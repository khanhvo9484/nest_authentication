import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IAuthUser } from '../auth.interface';
import { AuthService } from '../auth.service';
import { Profile, Strategy, VerifyCallback } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: '1590407008431141',
      clientSecret: '5cfc146c1c595cdb885056fdcfa4d78e',
      callbackURL: 'http://localhost:3000/api/v1/auth/facebook/callback',
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
    };

    const authUser = await this.authService.validateUser(user);

    done(null, authUser);
  }
}
