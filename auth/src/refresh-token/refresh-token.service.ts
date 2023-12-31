import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefreshToken, Prisma } from '@prisma/client';
@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  async refreshToken(
    refreshTokenWhereUniqueInput: Prisma.RefreshTokenWhereUniqueInput,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: refreshTokenWhereUniqueInput,
    });
  }

  async createRefreshToken(
    data: Prisma.RefreshTokenCreateInput,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  async updateRefreshToken(params: {
    where: Prisma.RefreshTokenWhereUniqueInput;
    data: Prisma.RefreshTokenUpdateInput;
  }): Promise<RefreshToken> {
    const { where, data } = params;

    return this.prisma.refreshToken.update({
      where,
      data,
    });
  }

  async deleteRefreshToken(
    where: Prisma.RefreshTokenWhereUniqueInput,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.delete({ where });
  }
}
