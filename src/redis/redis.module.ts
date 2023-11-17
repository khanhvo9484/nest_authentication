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
          socket: {
            host: 'redis-14427.c52.us-east-1-4.ec2.cloud.redislabs.com',
            port: 14427,
          },
          password: configService.get<string>('REDIS_PASSWORD'),
        });
        return {
          store: store as unknown as CacheStore,
        };
      },
    }),
  ],
})
export class RedisModule {}
