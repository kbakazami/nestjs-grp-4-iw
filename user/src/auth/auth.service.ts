import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  ValidateResponse,
} from '../stubs/auth/v1alpha/auth';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async validate(jwt: string): Promise<ValidateResponse> {
    const response: ValidateResponse = await firstValueFrom(
      this.authService.validate({
        jwt,
      }) as any,
    );

    return response;
  }
}
