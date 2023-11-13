import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { TransformEntityToDto } from 'src/decorators/entity-to-dto.decorator';
import CreateUserRequest from './users.dto';
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    const numberId = parseInt(id);
    const result = await this.userService.findUser({
      id: numberId,
    });
    console.log(result);
    console.log('hehe');
    return result;
  }

  @Post('/user')
  createUser(@Body() request: CreateUserRequest) {
    // this.userService.createUser(request)
    console.log(request);
  }
}
