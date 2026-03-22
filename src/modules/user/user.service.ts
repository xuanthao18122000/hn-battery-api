import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, ListUserDto } from './dto';
import { User } from 'src/database/entities';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * @description: Danh sách người dùng
   */
  async findAll(query: ListUserDto) {
    const [users, total] = await this.userRepo
      .fCreateFilterBuilder('user', query)
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.status',
        'user.phoneNumber',
        'user.roleId',
        'user.createdAt',
      ])
      .fAndWhere('status')
      .fAndWhere('roleId')
      .fAndWhereLikeString('fullName')
      .fAndWhereLikeString('phoneNumber')
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination()
      .getManyAndCount();

    return paginatedResponse(users, total, query);
  }

  /**
   * @description: Tìm kiếm người dùng theo ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return user;
  }

  async checkUserExisted(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }
  }

  /**
   * @description: Tìm kiếm nhiều người dùng theo danh sách ID
   */
  async findByIds(
    ids: number[],
    select: (keyof User)[] = ['id', 'fullName'],
  ): Promise<User[]> {
    return await this.userRepo
      .createQueryBuilder('user')
      .select(select.map((field) => `user.${field}`))
      .where('user.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * @description: Tạo người dùng mới
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(createUserDto);
    return await this.userRepo.save(user);
  }

  /**
   * @description: Cập nhật thông tin người dùng
   */
  async update(id: number, { status, password }: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (isValueDefinedAndChanged(user.status, status)) {
      user.status = status;
    }

    if (isValueDefinedAndChanged(user.password, password)) {
      user.password = password;
    }

    return await this.userRepo.save(user);
  }
}
