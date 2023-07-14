import { Controller, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AddRequest,
  AddResponse,
  CheckPasswordRequest,
  CheckPasswordResponse,
  CheckPasswordResponse_STATUS,
  DeleteRequest,
  DeleteResponse,
  GetRequest,
  GetResponse,
  UpdateRequest,
  UpdateResponse,
  User,
  USER_CR_UD_SERVICE_NAME,
  UserCRUDServiceController,
  UserCRUDServiceControllerMethods,
} from './stubs/user/v1alpha/user';

import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';

import { AuthGuard } from './auth/auth.guard';

@Controller()
@UserCRUDServiceControllerMethods()
export class AppController implements UserCRUDServiceController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  async get(request: GetRequest, metadata?: Metadata): Promise<GetResponse> {
    let user: User;
    let users: User[] = [];

    if (request.id) {
      user = await this.appService.findById(request.id);
      return { users: [user] };
    } else if (request.firstname) {
      users = await this.appService.findByFirstName(request.firstname);
      return { users };
    } else if (request.lastname) {
      users = await this.appService.findByLastName(request.lastname);
      return { users };
    } else if (request.email) {
      user = await this.appService.findByEmail(request.email);
      return { users: [user] };
    } else {
      users = await this.appService.findAll();
      return { users };
    }
  }

  @UseGuards(AuthGuard)
  async update(
    request: UpdateRequest,
    metadata?: Metadata,
  ): Promise<UpdateResponse> {
    const id = request.id;

    Object.keys(request).forEach(
      (key) => request[key] === undefined && delete request[key],
    );

    delete request.id;

    const user = await this.appService.update(id, request);

    return { user };
  }

  @UseGuards(AuthGuard)
  async delete(
    request: DeleteRequest,
    metadata?: Metadata,
  ): Promise<DeleteResponse> {
    const user = await this.appService.delete(request.id);

    return { user };
  }

  //No use of the AuthGard or users can't create an account
  @GrpcMethod(USER_CR_UD_SERVICE_NAME)
  async add(request: AddRequest, metadata?: Metadata): Promise<AddResponse> {
    try {
      const userExist = await this.appService.findByEmail(request.email);

      if (userExist) {
        return {
          user: undefined,
          message: 'An account with this email already exist',
        };
      }

      const saltRounds = 10;

      request.password = await bcrypt.hash(request.password, saltRounds);

      const user = await this.appService.create(request as any);

      return {
        user,
        message: 'Account created successfully !',
      };
    } catch (err) {
      console.log(err);
    }
  }

  async checkPassword(
    request: CheckPasswordRequest,
  ): Promise<CheckPasswordResponse> {
    try {
      const { user, match } = await this.appService.checkPassword(
        request.email,
        request.password,
      );

      if (!user) {
        return {
          status: CheckPasswordResponse_STATUS.NOT_FOUND,
          user: undefined,
        };
      }

      if (match) {
        return {
          user: user as any,
          status: CheckPasswordResponse_STATUS.OK,
        };
      }

      return {
        status: CheckPasswordResponse_STATUS.WRONG_PASSWORD,
        user: undefined,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
