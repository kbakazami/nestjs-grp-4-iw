import { Inject, Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CheckPasswordResponse,
  GetRequest,
  GetResponse,
  User,
  USER_CR_UD_SERVICE_NAME,
  USER_V1ALPHA_PACKAGE_NAME,
  UserCRUDServiceClient,
} from './stubs/user/v1alpha/user';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class AppService implements OnModuleInit {
  private userService: UserCRUDServiceClient;

  constructor(@Inject(USER_V1ALPHA_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit(): any {
    this.userService = this.client.getService<UserCRUDServiceClient>(
      USER_CR_UD_SERVICE_NAME,
    );
  }

  async checkPassword(
    email: string,
    password: string,
  ): Promise<CheckPasswordResponse> {
    const response: CheckPasswordResponse = await firstValueFrom(
      this.userService.checkPassword({ email, password }) as any,
    );

    return response;
  }

  async findUser(
    request: GetRequest,
    metadata: Record<string, any>,
  ): Promise<User> {
    const meta = new Metadata();
    Object.entries(metadata).map(([k, v]) => meta.add(k, v));

    const response: GetResponse = await firstValueFrom(
      this.userService.get(request, meta) as any,
    );

    return response.users?.[0];
  }
}
