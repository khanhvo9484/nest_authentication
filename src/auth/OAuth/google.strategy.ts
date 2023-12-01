import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { IAuthUser } from '../auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID:
        '896295432597-k8b9qtddkhk12vm3a9b9obap89ts6r2f.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails, photos } = profile;
    const user: IAuthUser = {
      email: emails[0].value,
      name: displayName,
      avatar: photos[0].value,
      password: '',
    };
    const authUser = await this.authService.validateUser(user);

    done(null, authUser);
  }
}
