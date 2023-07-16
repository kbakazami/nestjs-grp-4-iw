import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AuthServiceControllerMethods,
  LoginRequest,
  LoginResponse,
  LoginResponse_STATUS,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ValidateRequest,
  ValidateResponse,
} from './stubs/auth/v1alpha/auth';
import { Metadata, status as RpcStatus } from '@grpc/grpc-js';
import { CheckPasswordResponse_STATUS, User } from './stubs/user/v1alpha/user';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';
import { RefreshTokenService } from './refresh-token/refresh-token.service';

class LoginDTO {
  @IsEmail()
  email: string;

  password: string;
}

@Controller()
@AuthServiceControllerMethods()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async refreshToken(
    request: RefreshTokenRequest,
    metadata?: Metadata,
  ): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await this.refreshTokenService.refreshToken({
        refreshToken: request.refreshToken,
      });

      if (!refreshToken) {
        throw new RpcException({
          code: RpcStatus.NOT_FOUND,
          message: 'Refresh token not found',
        });
      }

      if (refreshToken.revoked) {
        throw new RpcException({
          code: RpcStatus.PERMISSION_DENIED,
          message: 'Refresh token was revoked',
        });
      }

      const user = await this.appService.findUser(
        {
          id: refreshToken.userId,
          firstname: undefined,
          lastname: undefined,
          email: undefined,
        },
        {
          Authorization: `Bearer ${this.jwtService.sign({ internal: true })}`,
        },
      );

      if (!user) {
        throw new RpcException({
          code: RpcStatus.NOT_FOUND,
          message: 'user not found',
        });
      }

      return {
        refreshToken: undefined,
        jwt: this.jwtService.sign({ user }),
        userId: user.id,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async validate(
    request: ValidateRequest,
    metadata?: Metadata,
  ): Promise<ValidateResponse> {
    try {
      const { user, internal }: { user: User; internal: boolean } =
        this.jwtService.verify(request.jwt);

      if (!user) {
        console.log('cannot check jwt token');
      }

      return {
        ok: true,
        userId: user?.id,
        userEmail: user?.email,
        internal: internal,
        userRole: user?.role,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      await this.validateDto(request, LoginDTO);

      const { user, status } = await this.appService.checkPassword(
        request.email,
        request.password,
      );

      switch (status) {
        case CheckPasswordResponse_STATUS.OK:
          return {
            jwt: this.jwtService.sign({ user }),
            user,
            status: LoginResponse_STATUS.OK,
          };
        case CheckPasswordResponse_STATUS.WRONG_PASSWORD:
          throw new RpcException('Wrong email or password');
        case CheckPasswordResponse_STATUS.NOT_FOUND:
          throw new RpcException("Email doesn't exist");
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async validateDto(data: any, Dto: any) {
    const dto = plainToInstance(Dto, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      console.log(errors);
    }
  }
}
