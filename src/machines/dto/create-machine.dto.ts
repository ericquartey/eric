import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MachineInstallStatus } from '@prisma/client';

export class CreateMachineDto {
  @IsString()
  model!: string;

  @IsString()
  serialNumber!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsEnum(MachineInstallStatus)
  installationStatus?: MachineInstallStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
