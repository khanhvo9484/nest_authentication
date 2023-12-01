import { AuthGuard } from './../auth/auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { Role } from 'role-guard/role.enum';
import { RolesGuard } from 'role-guard/roles.guard';
import { Roles } from 'role-guard/roles.decorator';
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
