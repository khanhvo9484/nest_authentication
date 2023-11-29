import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID:
        '314934727278-c4s66lgm8rg5079o25abp3v7eoqcq0aq.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/v1/auth/google/redirect',
      scope: ['profile', 'email'],
      accessType: 'offline',
      prompt: 'consent',
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    try {
      console.log('access: ', accessToken);
      console.log('refresh: ', refreshToken);
      console.log(profile);

      // Your validation logic here

      return done(null /* user object or false if validation fails */);
    } catch (error) {
      return done(error, false);
    }
  }
}
