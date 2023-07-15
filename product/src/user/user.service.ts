import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  GetRequest,
  GetResponse,
  User,
  USER_CR_UD_SERVICE_NAME,
  UserCRUDServiceClient,
} from '../stubs/user/v1alpha/user';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserCRUDServiceClient;

  constructor(@Inject(USER_CR_UD_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserCRUDServiceClient>(
      USER_CR_UD_SERVICE_NAME,
    );
  }

  async getUser(
    request: GetRequest,
    metadata: Record<string, any>,
  ): Promise<User> {
    const meta = new Metadata();
    Object.entries(metadata).map(([k, v]) => meta.add(k, v));

    let response: GetResponse;

    try {
      response = await firstValueFrom(
        this.userService.get(request, meta) as any,
      );
    } catch (error) {
      throw new RpcException(error);
    }

    return response.users?.[0];
  }
}
