import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { grpcConfig } from 'src/grpc.config';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice(grpcConfig(configService));
  await app.startAllMicroservices();

  await app.listen(6000);
}
bootstrap();
