import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BatteryCapacity } from 'src/database/entities';
import {
  CreateBatteryCapacityBulkItemDto,
  CreateBatteryCapacityDto,
  ListBatteryCapacityDto,
  UpdateBatteryCapacityDto,
} from './dto';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { StatusCommonEnum } from 'src/enums';

@Injectable()
export class BatteryCapacityService {
  constructor(
    @InjectRepository(BatteryCapacity)
    private readonly repo: Repository<BatteryCapacity>,
  ) {}

  async findAll(query: ListBatteryCapacityDto) {
    const qb = this.repo
      .fCreateFilterBuilder('bc', query)
      .select([
        'bc.id',
        'bc.name',
        'bc.position',
        'bc.status',
        'bc.createdAt',
        'bc.updatedAt',
      ])
      .fAndWhere('status')
      .fAndWhereLikeString('name');

    qb.orderBy('bc.position', 'ASC').addOrderBy('bc.id', 'ASC');

    const [data, total] = await qb.fAddPagination().getManyAndCount();
    return paginatedResponse(data, total, query);
  }

  async findOne(id: number): Promise<BatteryCapacity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(ErrorCode.BATTERY_CAPACITY_NOT_FOUND);
    }
    return row;
  }

  async create(dto: CreateBatteryCapacityDto): Promise<BatteryCapacity> {
    const name = dto.name.trim();
    const existsName = await this.repo.findOne({ where: { name } });
    if (existsName) {
      throw new BadRequestException('Tên dung lượng đã tồn tại');
    }

    const entity = this.repo.create({
      name,
      position: dto.position ?? 0,
      status: dto.status,
    });
    return this.repo.save(entity);
  }

  async createBulks(
    dtos: CreateBatteryCapacityBulkItemDto[],
  ): Promise<BatteryCapacity[]> {
    if (!dtos?.length) return [];

    const names = dtos.map((d) => d.name.trim());
    const existingByName = await this.repo.find({
      where: { name: In(names) },
    });

    const existingNameSet = new Set(existingByName.map((r) => r.name));
    const created: BatteryCapacity[] = [];
    const batchNameSet = new Set<string>();

    for (const item of dtos) {
      const name = item.name.trim();
      if (!name || existingNameSet.has(name) || batchNameSet.has(name)) {
        continue;
      }

      const entity = this.repo.create({
        name,
        position: item.position ?? 0,
        status: item.status ?? StatusCommonEnum.ACTIVE,
      });

      const saved = await this.repo.save(entity);
      created.push(saved);
      batchNameSet.add(saved.name);
      existingNameSet.add(saved.name);
    }

    return created;
  }

  async update(
    id: number,
    dto: UpdateBatteryCapacityDto,
  ): Promise<BatteryCapacity> {
    const row = await this.findOne(id);

    if (dto.name !== undefined && dto.name.trim() !== row.name) {
      const name = dto.name.trim();
      const exists = await this.repo.findOne({ where: { name } });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Tên dung lượng đã tồn tại');
      }
      row.name = name;
    }

    if (dto.position !== undefined) row.position = dto.position;
    if (dto.status !== undefined) row.status = dto.status;

    return this.repo.save(row);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
