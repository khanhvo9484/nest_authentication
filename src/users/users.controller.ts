import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TransformEntityToDto } from 'src/decorators/entity-to-dto.decorator';
import CreateUserRequest, {
  UpdateUserRequest,
  UserResponse,
} from './users.dto';
import { Request } from 'express';
import { Public } from 'src/auth/public-route.decorator';
import { plainToClass } from 'class-transformer';
import { payloadType } from 'src/auth/auth.service';
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Public()
  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    const numberId = parseInt(id);
    const result = await this.userService.findUser({
      id: numberId,
    });
    if (!result) {
      throw new BadRequestException('User not found');
    } else
      return {
        message: 'Get user info',
        data: plainToClass(UserResponse, result),
      };
  }

  @Put('/user')
  async updateUser(
    @Req() request: Request & { user: payloadType },
    @Body() body: UpdateUserRequest,
  ) {
    if (!request['user']) {
      throw new BadRequestException('Invalid call');
    }
    if (!request['user'].id) {
      throw new BadRequestException('Invalid call');
    }
    const userId = request['user'].id;
    const result = await this.userService.updateUser({
      where: {
        id: userId,
      },
      data: body,
    });
    return {
      message: 'Update user info',
      data: plainToClass(UserResponse, result),
    };
  }
}
