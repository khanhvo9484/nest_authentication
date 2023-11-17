import { Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheStore } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          url: configService.get<string>('REDIS_URL'),
        });
        return {
          store: store as unknown as CacheStore,
        };
      },
    }),
  ],
})
export class RedisModule {}
