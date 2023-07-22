import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {
  GetRequest,
  GetResponse,
  ProductCRUDServiceControllerMethods,
  Product,
  UpdateRequest,
  UpdateResponse,
  DeleteRequest,
  DeleteResponse,
  PRODUCT_CR_UD_SERVICE_NAME,
  AddRequest,
  AddResponse,
  ProductCRUDServiceController,
} from './stubs/product/v1alpha/product';
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UserCRUDServiceClient } from './stubs/user/v1alpha/user';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';

@Controller()
@ProductCRUDServiceControllerMethods()
export class AppController implements ProductCRUDServiceController {
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async get(request: GetRequest, metadata?: Metadata): Promise<GetResponse> {
    let product: Product;
    let products: Product[] = [];

    if (request.id) {
      product = await this.appService.findById(request.id);
      return { products: [product] };
    } else {
      products = await this.appService.findAll();
      return { products };
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

    if (!request.userId) {
      throw new RpcException('No user provided');
    }

    const userExist = await this.isUserExist(request.userId);

    if (!userExist) {
      throw new RpcException("User doesn't exist");
    }

    await this.isUserOwner(request.userId, id, 'update');

    const product = await this.appService.update(id, {
      name: request.name,
      description: request.description,
      price: request.price,
    });

    return { product };
  }

  async delete(
    request: DeleteRequest,
    metadata?: Metadata,
  ): Promise<DeleteResponse> {
    if (!request.userId) {
      throw new RpcException('No user provided');
    }

    const userExist = await this.isUserExist(request.userId);

    if (!userExist) {
      throw new RpcException("User doesn't exist");
    }

    await this.isUserOwner(request.userId, request.id, 'delete');

    const product = await this.appService.delete(request.id);

    return { product };
  }

  @GrpcMethod(PRODUCT_CR_UD_SERVICE_NAME)
  async add(request: AddRequest): Promise<AddResponse> {
    if (!request.userId) {
      throw new RpcException('No user provided');
    }

    const userExist = await this.isUserExist(request.userId);

    if (!userExist) {
      throw new RpcException("User doesn't exist");
    }

    const product = await this.appService.create(request as any);
    return { product };
  }

  async isUserOwner(userId, productId, action) {
    const product = await this.appService.findById(productId);

    if (userId !== product.userId) {
      if (action === 'update') {
        throw new RpcException(
          "You can't edit this product because you aren't the owner",
        );
      } else if (action === 'delete') {
        throw new RpcException(
          "You can't delete this product because you aren't the owner",
        );
      }
    }
  }

  async isUserExist(userId) {
    const userExist = await this.userService.getUser(
      {
        id: userId,
        firstname: undefined,
        lastname: undefined,
        email: undefined,
      },
      { Authorization: `Bearer ${this.jwtService.sign({ internal: true })}` },
    );

    if (!userExist) {
      return false;
    }

    return true;
  }
}
