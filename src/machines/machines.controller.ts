import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PM)
  create(@Body() dto: CreateMachineDto) {
    return this.machinesService.create(dto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.machinesService.findAll(projectId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PM, Role.INSTALLER)
  update(@Param('id') id: string, @Body() dto: UpdateMachineDto) {
    return this.machinesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PM)
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }
}
