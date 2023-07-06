import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  User,
  GetRequest,
  GetResponse,
  AddRequest,
  AddResponse,
  UpdateRequest,
  UpdateResponse,
  DeleteRequest,
  DeleteResponse,
  USER_CR_UD_SERVICE_NAME,
  UserCRUDServiceController,
  UserCRUDServiceControllerMethods,
} from './stubs/user/v1alpha/user';

import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';

@Controller()
@UserCRUDServiceControllerMethods()
export class AppController implements UserCRUDServiceController {
  constructor(private readonly appService: AppService) {}

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
      users = await this.appService.findByEmail(request.email);
      return { users };
    } else {
      users = await this.appService.findAll();
      return { users };
    }
  }

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

  async delete(
    request: DeleteRequest,
    metadata?: Metadata,
  ): Promise<DeleteResponse> {
    const user = await this.appService.delete(request.id);

    return { user };
  }

  @GrpcMethod(USER_CR_UD_SERVICE_NAME)
  async add(request: AddRequest, metadata?: Metadata): Promise<AddResponse> {
    const saltRounds = 10;

    request.password = await bcrypt.hash(request.password, saltRounds);

    const user = await this.appService.create(request as any);

    return { user };
  }
}
