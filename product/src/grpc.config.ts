import {
  ClientProviderOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import { PRODUCT_V1ALPHA_PACKAGE_NAME } from './stubs/product/v1alpha/product';
import { ConfigService } from '@nestjs/config';
import {
  USER_CR_UD_SERVICE_NAME,
  USER_V1ALPHA_PACKAGE_NAME,
} from './stubs/user/v1alpha/user';
import { ChannelCredentials } from '@grpc/grpc-js';

export const grpcConfig = (configService: ConfigService): GrpcOptions =>
  addReflectionToGrpcConfig({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:3002',
      package: PRODUCT_V1ALPHA_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/product/v1alpha/product.proto'),
    },
  });

export const userGrpcOptions = (
  configService: ConfigService,
): ClientProviderOptions => ({
  name: USER_CR_UD_SERVICE_NAME,
  transport: Transport.GRPC,
  options: {
    url: configService.get('USER_API_URL'),
    package: USER_V1ALPHA_PACKAGE_NAME,
    loader: {
      includeDirs: [join(__dirname, 'proto')],
    },
    protoPath: [join(__dirname, 'proto/user/v1alpha/user.proto')],
    credentials: ChannelCredentials.createInsecure(),
  },
});
