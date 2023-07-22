import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ClientsModule } from '@nestjs/microservices';
import { userGrpcOptions } from 'src/grpc.config';
import { USER_CR_UD_SERVICE_NAME } from '../stubs/user/v1alpha/user';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_CR_UD_SERVICE_NAME,
        inject: [ConfigService],
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          userGrpcOptions(configService),
      },
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
