import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

const USD_EXCHANGE_RATE = 1.08;

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
  }

  async findAllWithValue() {
    const warehouses = await this.prisma.warehouse.findMany({
      include: {
        machines: {
          select: {
            id: true,
            valueEur: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }, { location: 'asc' }],
    });

    return warehouses.map((warehouse) => {
      const valueEur = warehouse.machines.reduce(
        (sum, machine) => sum + Number(machine.valueEur),
        0,
      );
      const valueUsd = valueEur * USD_EXCHANGE_RATE;

      return {
        id: warehouse.id,
        name: warehouse.name,
        location: warehouse.location,
        machinesCount: warehouse.machines.length,
        valueEur: Number(valueEur.toFixed(2)),
        valueUsd: Number(valueUsd.toFixed(2)),
        usdExchangeRate: USD_EXCHANGE_RATE,
      };
    });
  }
}
