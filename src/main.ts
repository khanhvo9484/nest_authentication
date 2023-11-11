import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
declare const module: any;
async function bootstrap() {
  const logger= new MyLogger()
  const app = await NestFactory.create(AppModule,{
    bufferLogs:true,
    cors: true
  });
  const config= new ConfigService()
  await app.listen(config.get<number>('port'));
  logger.log("App server start at port: ", )
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();
