export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,

  REDIS_URL: process.env.REDIS_URL,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  JWT_REFRESH_EXPIRATION_TIME: process.env.JWT_REFRESH_EXPIRATION_TIME,
});