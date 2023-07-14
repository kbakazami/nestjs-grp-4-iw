import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUTH_SERVICE_NAME } from '../stubs/auth/v1alpha/auth';
import { authGrpcOptions } from '../grpc.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        inject: [ConfigService],
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          authGrpcOptions(configService),
      },
    ]),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
