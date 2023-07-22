import { Injectable } from '@nestjs/common';
import { User } from './stubs/user/v1alpha/user';
import { PrismaService } from './prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    if ((await this.findAll()).length === 0) {
      data.role = Role.ADMIN;
    }
    return this.prisma.user.create({ data }) as any;
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany() as any;
  }

  findById(id: number): Promise<User> {
    try {
      return this.prisma.user.findUnique({
        where: { id },
      }) as any;
    } catch (error) {
      throw new RpcException(`User not found with id ${id} - ERROR : ${error}`);
    }
  }

  findByFirstName(firstname: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { firstname },
    }) as any;
  }

  findByLastName(lastname: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { lastname },
    }) as any;
  }

  findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as any;
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as any;
  }

  delete(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    }) as any;
  }

  async checkPassword(
    email: string,
    password: string,
  ): Promise<{ user: User; match: boolean }> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    })) as any;

    if (!user) {
      return { user: null, match: false };
    }

    const match = await bcrypt.compare(password, user.password);

    return { user, match };
  }
}
