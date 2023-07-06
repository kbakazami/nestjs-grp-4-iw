import { Injectable } from '@nestjs/common';
import { User } from './stubs/user/v1alpha/user';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findById(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByFirstName(firstname: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { firstname },
    });
  }

  findByLastName(lastname: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { lastname },
    });
  }

  findByEmail(email: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { email },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  delete(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
