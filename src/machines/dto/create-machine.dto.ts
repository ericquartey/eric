import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MachineInstallStatus } from '@prisma/client';

export class CreateMachineDto {
  @IsString()
  model!: string;

  @IsString()
  serialNumber!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  valueEur?: number;

  @IsOptional()
  @IsEnum(MachineInstallStatus)
  installationStatus?: MachineInstallStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
