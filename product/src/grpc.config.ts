import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import {PRODUCT_V1ALPHA_PACKAGE_NAME} from "./stubs/product/v1alpha/product";
export const grpcConfig = addReflectionToGrpcConfig({
    transport: Transport.GRPC,
    options: {
        url: '0.0.0.0:6000',
        package: PRODUCT_V1ALPHA_PACKAGE_NAME,
        protoPath: join(__dirname, 'proto/product/v1alpha/product.proto'),
    },
}) as GrpcOptions;