import {
  ClientProviderOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import { join } from 'path';
import { AUTH_V1ALPHA_PACKAGE_NAME } from './stubs/auth/v1alpha/auth';
import { ConfigService } from '@nestjs/config';
import { USER_V1ALPHA_PACKAGE_NAME } from './stubs/user/v1alpha/user';
import { ChannelCredentials } from '@grpc/grpc-js';

export default (configService: ConfigService): GrpcOptions => {
  return addReflectionToGrpcConfig({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${configService.get<number>('PORT')}`,
      package: AUTH_V1ALPHA_PACKAGE_NAME,
      loader: {
        includeDirs: [join(__dirname, 'proto')],
      },
      protoPath: [join(__dirname, 'proto/auth/v1alpha/auth.proto')],
    },
  });
};

export const userGrpcConfig = (
  configService: ConfigService,
): ClientProviderOptions => ({
  name: USER_V1ALPHA_PACKAGE_NAME,
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
