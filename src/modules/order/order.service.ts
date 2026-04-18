import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from 'src/database/entities';
import { CreateOrderDto, ListOrderDto, UpdateOrderDto } from './dto';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { OrderStatusEnum } from 'src/database/entities/order.entity';
import { TelegramService } from '../telegram/telegram.service';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly telegramService: TelegramService,
    private readonly customerService: CustomerService,
  ) {}

  async findAll(query: ListOrderDto) {
    const qb = this.orderRepo
      .fCreateFilterBuilder('order', query)
      .select([
        'order.id',
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

  /**
   * Thống kê tổng hợp đơn hàng — dùng cho card stats trang admin (không phụ thuộc phân trang).
   */
  async getStats() {
    const qb = this.orderRepo.createQueryBuilder('order');

    const [total, statusRows, revenueRow] = await Promise.all([
      qb.getCount(),
      this.orderRepo
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany<{ status: string; count: string }>(),
      this.orderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
        .where('order.status = :status', {
          status: OrderStatusEnum.COMPLETED,
        })
        .getRawOne<{ revenue: string }>(),
    ]);

    const byStatus: Record<number, number> = {
      [OrderStatusEnum.NEW]: 0,
      [OrderStatusEnum.CONFIRMED]: 0,
      [OrderStatusEnum.SHIPPING]: 0,
      [OrderStatusEnum.COMPLETED]: 0,
      [OrderStatusEnum.CANCELLED]: 0,
    };
    for (const row of statusRows) {
      byStatus[Number(row.status)] = Number(row.count);
    }

    return {
      total,
      new: byStatus[OrderStatusEnum.NEW],
      confirmed: byStatus[OrderStatusEnum.CONFIRMED],
      shipping: byStatus[OrderStatusEnum.SHIPPING],
      completed: byStatus[OrderStatusEnum.COMPLETED],
      cancelled: byStatus[OrderStatusEnum.CANCELLED],
      revenue: Number(revenueRow?.revenue ?? 0),
    };
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
    const finalAmount = createDto.totalAmount || totalAmountFromItems;

    // Tìm hoặc tạo customer theo phone — vẫn giữ snapshot tên/phone/... trên order
    const customer = await this.customerService.findOrCreateByPhone({
      name: createDto.customerName,
      phone: createDto.phone,
      email: createDto.email,
      address: createDto.shippingAddress,
    });

    const initial = this.orderRepo.create({
      customerId: customer.id,
      customerName: createDto.customerName,
      phone: createDto.phone,
      email: createDto.email,
      shippingAddress: createDto.shippingAddress,
      note: createDto.note,
      totalAmount: finalAmount,
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
    await this.customerService.incrementStats(customer.id, finalAmount);
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

