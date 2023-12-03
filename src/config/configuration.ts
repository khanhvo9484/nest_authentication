export default () => ({
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,

  FE_EMAIL_VERIFICATION_URL: process.env.FRONTEND_URL + '/auth/verify-email?',
  FE_RESET_PASSWORD_URL: process.env.FRONTEND_URL + '/auth/reset-password?',

  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,

  REDIS_URL: process.env.REDIS_URL,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  JWT_REFRESH_EXPIRATION_TIME: process.env.JWT_REFRESH_EXPIRATION_TIME,

  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET,
  JWT_TOKEN_EXPIRATION_TIME: process.env.JWT_TOKEN_EXPIRATION_TIME,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.BACKEND_URL + '/api/v1/auth/google/callback',

  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL:
    process.env.BACKEND_URL + '/api/v1/auth/facebook/callback',
});
