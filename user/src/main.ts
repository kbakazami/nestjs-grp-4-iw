import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import grpcOption from './grpc.config';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice(grpcOption(configService));

  await app.startAllMicroservices();

  await app.listen(configService.get('HEALTH_PORT'));
}
bootstrap();
