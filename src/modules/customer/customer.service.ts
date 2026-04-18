import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, Order, ContactInformation } from 'src/database/entities';
import {
  ListCustomerDto,
  UpdateCustomerDto,
  ListCustomerOrdersDto,
} from './dto';
import { DeletedEnum } from 'src/enums';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ContactInformation)
    private readonly contactRepo: Repository<ContactInformation>,
  ) {}

  /**
   * Danh sách khách hàng (CMS)
   */
  async findAll(query: ListCustomerDto) {
    const qb = this.customerRepo
      .fCreateFilterBuilder('customer', query)
      .select([
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.email',
        'customer.address',
        'customer.totalOrders',
        'customer.totalSpent',
        'customer.lastOrderedAt',
        'customer.status',
        'customer.createdAt',
      ])
      .fAndWhere('status')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE);

    if (query.search) {
      qb.andWhere(
        '(customer.name LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.fOrderBy('createdAt', 'DESC').fAddPagination();

    const [items, total] = await qb.getManyAndCount();
    return paginatedResponse(items, total, query);
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });
    if (!customer) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }
    return customer;
  }

  /**
   * Danh sách đơn hàng của customer
   */
  async findOrders(customerId: number, query: ListCustomerOrdersDto) {
    await this.findOne(customerId);

    const qb = this.orderRepo
      .fCreateFilterBuilder('order', query)
      .where('order.customerId = :customerId', { customerId })
      .select([
        'order.id',
        'order.customerName',
        'order.phone',
        'order.email',
        'order.totalAmount',
        'order.status',
        'order.paymentMethod',
        'order.createdAt',
      ])
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination();

    const [items, total] = await qb.getManyAndCount();
    return paginatedResponse(items, total, query);
  }

  /**
   * Danh sách yêu cầu liên hệ của customer
   */
  async findContacts(customerId: number, query: ListCustomerOrdersDto) {
    await this.findOne(customerId);

    const qb = this.contactRepo
      .fCreateFilterBuilder('contact', query)
      .where('contact.customerId = :customerId', { customerId })
      .select([
        'contact.id',
        'contact.name',
        'contact.phone',
        'contact.email',
        'contact.productId',
        'contact.status',
        'contact.notes',
        'contact.createdAt',
      ])
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination();

    const [items, total] = await qb.getManyAndCount();
    return paginatedResponse(items, total, query);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (dto.name !== undefined) customer.name = dto.name;
    if (dto.phone !== undefined) customer.phone = dto.phone;
    if (dto.email !== undefined) customer.email = dto.email;
    if (dto.address !== undefined) customer.address = dto.address;
    if (dto.status !== undefined) customer.status = dto.status;

    return this.customerRepo.save(customer);
  }

  async softDelete(id: number): Promise<void> {
    const customer = await this.findOne(id);
    customer.deleted = DeletedEnum.DELETED;
    await this.customerRepo.save(customer);
  }

  /**
   * Tìm customer theo phone, nếu chưa có thì tạo mới.
   * Đồng thời cập nhật thông tin mới nhất (name, email, address).
   * Dùng cho flow order: FE public submit order.
   */
  async findOrCreateByPhone(input: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }): Promise<Customer> {
    const phone = input.phone.trim();

    let customer = await this.customerRepo.findOne({
      where: { phone, deleted: DeletedEnum.AVAILABLE },
    });

    if (!customer) {
      customer = this.customerRepo.create({
        name: input.name,
        phone,
        email: input.email,
        address: input.address,
      });
      return this.customerRepo.save(customer);
    }

    // Cập nhật thông tin mới nhất (không ghi đè nếu input rỗng)
    let changed = false;
    if (input.name && input.name !== customer.name) {
      customer.name = input.name;
      changed = true;
    }
    if (input.email && input.email !== customer.email) {
      customer.email = input.email;
      changed = true;
    }
    if (input.address && input.address !== customer.address) {
      customer.address = input.address;
      changed = true;
    }
    if (changed) {
      return this.customerRepo.save(customer);
    }
    return customer;
  }

  /**
   * Cập nhật thống kê (gọi sau khi tạo order thành công).
   */
  async incrementStats(
    customerId: number,
    orderAmount: number,
  ): Promise<void> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) return;

    customer.totalOrders = (customer.totalOrders ?? 0) + 1;
    customer.totalSpent =
      Number(customer.totalSpent ?? 0) + Number(orderAmount ?? 0);
    customer.lastOrderedAt = new Date();
    await this.customerRepo.save(customer);
  }
}
