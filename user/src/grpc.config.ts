import {
  ClientProviderOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { USER_V1ALPHA_PACKAGE_NAME } from './stubs/user/v1alpha/user';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { AUTH_V1ALPHA_PACKAGE_NAME } from './stubs/auth/v1alpha/auth';
import { ChannelCredentials } from '@grpc/grpc-js';

export default (configService: ConfigService): GrpcOptions => {
  return addReflectionToGrpcConfig({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:3000',
      package: USER_V1ALPHA_PACKAGE_NAME,
      loader: {
        includeDirs: [join(__dirname, 'proto')],
      },
      protoPath: [join(__dirname, 'proto/user/v1alpha/user.proto')],
    },
  });
};

export const authGrpcOptions = (
  configService: ConfigService,
): ClientProviderOptions => ({
  name: AUTH_V1ALPHA_PACKAGE_NAME,
  transport: Transport.GRPC,
  options: {
    url: configService.get('AUTH_API_URL'),
    package: AUTH_V1ALPHA_PACKAGE_NAME,
    loader: {
      includeDirs: [join(__dirname, 'proto')],
    },
    protoPath: [join(__dirname, 'proto/auth/v1alpha/auth.proto')],
    credentials: ChannelCredentials.createInsecure(),
  },
});
