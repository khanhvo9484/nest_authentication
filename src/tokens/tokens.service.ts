import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User, UserToken } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  async createToken(data: Prisma.UserTokenCreateInput): Promise<UserToken> {
    const result = await this.prisma.userToken.create({ data });
    return result;
  }

  async findToken(userToken: string) {
    const result: UserToken = await this.prisma.userToken.findUnique({
      where: { token: userToken },
    });
    return result;
  }

  async setTokenUsed(userToken: string) {
    const result = await this.prisma.userToken.update({
      where: { token: userToken },
      data: { isUsed: true },
    });
    return result;
  }

  async deleteToken(userToken: string) {
    const result = await this.prisma.userToken.delete({
      where: { token: userToken },
    });
    return result;
  }
}
