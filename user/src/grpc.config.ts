import { GrpcOptions, Transport } from '@nestjs/microservices';
import { USER_V1ALPHA_PACKAGE_NAME } from './stubs/user/v1alpha/user';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import { join } from 'path';

export const grpcConfig = addReflectionToGrpcConfig({
  transport: Transport.GRPC,
  options: {
    url: '127.0.0.1:3000',
    package: USER_V1ALPHA_PACKAGE_NAME,
    protoPath: join(__dirname, 'proto/user/v1alpha/user.proto'),
  },
}) as GrpcOptions;
