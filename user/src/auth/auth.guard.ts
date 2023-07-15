import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { ValidateResponse } from '../stubs/auth/v1alpha/auth';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToRpc().getContext();

      const type = context.getType();
      const prefix = 'Bearer';

      let header;

      //If the request is of the type RPC
      if (type === 'rpc') {
        //Get the data stored in Metadata
        const metadata = context.getArgByIndex(1);
        if (!metadata) {
          console.log('No metadata provided');
        }
        //Get the value stored in Authorization with the prefix "Bearer" and the token
        header = metadata.get('Authorization')[0];
      }

      //No header or forgot to add "Bearer"
      if (!header || !header.includes(prefix)) {
        console.log("Header isn't set correctly");
      }

      //Removed the prefix "Bearer"
      const token = header.slice(header.indexOf(' ') + 1);

      //Check the token
      const response: ValidateResponse = await this.authService.validate(token);

      if (response?.ok !== true) {
        console.log('error');
      }

      if (response.internal) {
        return true;
      }

      request.user = {
        id: response.userId,
        email: response.userEmail,
      };

      return true;
    } catch (error) {
      console.log('Error from auth gard :');
      console.log({ error });
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: error?.details || error.message,
      });
    }
  }
}
