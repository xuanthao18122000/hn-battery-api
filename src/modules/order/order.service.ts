import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from 'src/database/entities';
import { CreateOrderDto, ListOrderDto, UpdateOrderDto } from './dto';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { OrderStatusEnum } from 'src/database/entities/order.entity';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly telegramService: TelegramService,
  ) {}

  async findAll(query: ListOrderDto) {
    const qb = this.orderRepo
      .fCreateFilterBuilder('order', query)
      .select([
        'order.id',
        'order.code',
        'order.customerName',
        'order.phone',
        'order.email',
        'order.totalAmount',
        'order.status',
        'order.paymentMethod',
        'order.createdAt',
      ]);

    if (query.search) {
      qb.andWhere(
        '(order.customerName LIKE :search OR order.phone LIKE :search OR order.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.paymentMethod) {
      qb.andWhere('order.paymentMethod = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }

    qb.fOrderBy('createdAt', 'DESC').fAddPagination();

    const [orders, total] = await qb.getManyAndCount();
    return paginatedResponse(orders, total, query);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    return order;
  }

  async create(createDto: CreateOrderDto): Promise<Order> {
    const totalAmountFromItems =
      createDto.items?.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ) ?? 0;

    const initial = this.orderRepo.create({
      customerName: createDto.customerName,
      phone: createDto.phone,
      email: createDto.email,
      shippingAddress: createDto.shippingAddress,
      note: createDto.note,
      totalAmount: createDto.totalAmount || totalAmountFromItems,
      status: createDto.status ?? OrderStatusEnum.NEW,
      paymentMethod: createDto.paymentMethod,
      items: createDto.items?.map((i) =>
        this.orderItemRepo.create({
          productId: i.productId,
          productName: i.productName,
          productSlug: i.productSlug,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.unitPrice * i.quantity,
        }),
      ),
    });

    const saved = await this.orderRepo.save(initial);
    this.telegramService.sendOrderNotification(saved);

    return this.findOne(saved.id);
  }

  async update(id: number, updateDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateDto.customerName !== undefined) {
      order.customerName = updateDto.customerName;
    }
    if (updateDto.phone !== undefined) {
      order.phone = updateDto.phone;
    }
    if (updateDto.email !== undefined) {
      order.email = updateDto.email;
    }
    if (updateDto.shippingAddress !== undefined) {
      order.shippingAddress = updateDto.shippingAddress;
    }
    if (updateDto.note !== undefined) {
      order.note = updateDto.note;
    }
    if (updateDto.totalAmount !== undefined) {
      order.totalAmount = updateDto.totalAmount;
    }
    if (updateDto.status !== undefined) {
      order.status = updateDto.status;
    }
    if (updateDto.paymentMethod !== undefined) {
      order.paymentMethod = updateDto.paymentMethod;
    }

    await this.orderRepo.save(order);
    return this.findOne(id);
  }
}

