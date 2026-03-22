import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateVehicleBulkItemDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  ListVehicleDto,
} from './dto';
import { Vehicle } from 'src/database/entities';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { DeletedEnum, StatusCommonEnum, VehicleTypeEnum } from 'src/enums';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  private generateSlug(name: string) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `vehicle-${Date.now()}`;
  }

  private generateUniqueSlug(baseSlug: string, existingSlugSet: Set<string>) {
    if (!existingSlugSet.has(baseSlug)) {
      return baseSlug;
    }

    let index = 1;
    let nextSlug = `${baseSlug}-${index}`;

    while (existingSlugSet.has(nextSlug)) {
      index += 1;
      nextSlug = `${baseSlug}-${index}`;
    }

    return nextSlug;
  }

  async findAll(query: ListVehicleDto) {
    const [vehicles, total] = await this.vehicleRepo
      .fCreateFilterBuilder('vehicle', query)
      .select([
        'vehicle.id',
        'vehicle.name',
        'vehicle.slug',
        'vehicle.type',
        'vehicle.imageUrl',
        'vehicle.description',
        'vehicle.priority',
        'vehicle.status',
        'vehicle.createdAt',
      ])
      .fAndWhere('status')
      .fAndWhere('type')
      .fAndWhereLikeString('name')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE)
      .fOrderBy('priority', 'ASC')
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination()
      .getManyAndCount();

    return paginatedResponse(vehicles, total, query);
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });
    if (!vehicle) {
      throw new NotFoundException(ErrorCode.VEHICLE_NOT_FOUND);
    }
    return vehicle;
  }

  async findBySlug(slug: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
    });
    if (!vehicle) {
      throw new NotFoundException(ErrorCode.VEHICLE_NOT_FOUND);
    }
    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepo.findOne({
      where: { slug: createVehicleDto.slug },
    });
    if (existingVehicle) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    const vehicle = this.vehicleRepo.create(createVehicleDto);
    const saved = await this.vehicleRepo.save(vehicle);
    return saved;
  }

  /**
   * Tạo nhiều xe cùng lúc (slug tự sinh nếu không truyền, bỏ qua bản ghi trùng slug)
   */
  async createBulks(dtos: CreateVehicleBulkItemDto[]): Promise<Vehicle[]> {
    if (!dtos || dtos.length === 0) {
      return [];
    }

    const inputSlugs = dtos.map((d) =>
      d.slug?.trim() ? d.slug.trim() : this.generateSlug(d.name),
    );

    const existingBySlug = await this.vehicleRepo.find({
      where: { slug: In(inputSlugs) },
    });

    const existingSlugSet = new Set(existingBySlug.map((v) => v.slug));
    const created: Vehicle[] = [];

    for (const item of dtos) {
      const name = item.name.trim();
      const preferredSlug = item.slug?.trim() || this.generateSlug(name);
      const slug = this.generateUniqueSlug(preferredSlug, existingSlugSet);

      const vehicle = this.vehicleRepo.create({
        name,
        slug,
        type: item.type,
        imageUrl: item.imageUrl ?? undefined,
        description: item.description ?? undefined,
        priority: item.priority ?? 0,
        status: StatusCommonEnum.ACTIVE,
      });

      const saved = await this.vehicleRepo.save(vehicle);
      created.push(saved);
      existingSlugSet.add(saved.slug);
    }

    return created;
  }

  /**
   * Tạo vehicle nếu slug chưa tồn tại — giữ nguyên slug (sync từ category bulk).
   */
  async createIfNotExistsExactSlug(dto: {
    name: string;
    slug: string;
    type: VehicleTypeEnum;
    imageUrl?: string;
    description?: string;
    priority?: number;
  }): Promise<Vehicle | null> {
    const name = dto.name.trim();
    const slug = dto.slug.trim();
    if (!name || !slug) return null;

    const exists = await this.vehicleRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
    });
    if (exists) return null;

    const vehicle = this.vehicleRepo.create({
      name,
      slug,
      type: dto.type,
      imageUrl: dto.imageUrl ?? undefined,
      description: dto.description ?? undefined,
      priority: dto.priority ?? 0,
      status: StatusCommonEnum.ACTIVE,
    });
    return await this.vehicleRepo.save(vehicle);
  }

  /**
   * Sync từ seed category: vehicle đã tồn tại thì gán ảnh nếu đang trống (mô tả chỉ trên category).
   */
  async applySeedMediaIfEmpty(
    slug: string,
    dto: { imageUrl?: string },
  ): Promise<void> {
    const s = slug.trim();
    if (!s) return;

    const vehicle = await this.vehicleRepo.findOne({
      where: { slug: s, deleted: DeletedEnum.AVAILABLE },
    });
    if (!vehicle) return;

    const img = dto.imageUrl?.trim();
    if (!img || vehicle.imageUrl) return;

    vehicle.imageUrl = img.length > 500 ? img.slice(0, 500) : img;
    await this.vehicleRepo.save(vehicle);
  }

  async update(
    id: number,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    const oldSlug = vehicle.slug;

    if (
      updateVehicleDto.slug !== undefined &&
      updateVehicleDto.slug !== vehicle.slug
    ) {
      const existingVehicle = await this.vehicleRepo.findOne({
        where: { slug: updateVehicleDto.slug },
      });
      if (existingVehicle) {
        throw new BadRequestException('Slug đã tồn tại');
      }
    }

    const allowedFields: (keyof UpdateVehicleDto)[] = [
      'name',
      'slug',
      'type',
      'imageUrl',
      'description',
      'priority',
      'status',
    ];
    allowedFields.forEach((key) => {
      if (
        updateVehicleDto[key] !== undefined &&
        isValueDefinedAndChanged(vehicle[key], updateVehicleDto[key])
      ) {
        (vehicle as any)[key] = updateVehicleDto[key];
      }
    });

    const saved = await this.vehicleRepo.save(vehicle);
    return saved;
  }

  async softDelete(id: number): Promise<void> {
    const vehicle = await this.findOne(id);
    vehicle.deleted = DeletedEnum.DELETED;
    await this.vehicleRepo.save(vehicle);
  }
}
