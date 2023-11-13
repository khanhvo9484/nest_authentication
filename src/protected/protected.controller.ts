import { AuthGuard } from './../auth/auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { Role } from 'src/role-guard/role.enum';
import { RolesGuard } from 'src/role-guard/roles.guard';
import { Roles } from 'src/role-guard/roles.decorator';
@Controller('protected')
export class ProtectedController {
  constructor() {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  getHello(): string {
    return 'Hello from protected route';
  }
}
