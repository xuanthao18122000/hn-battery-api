import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from 'src/database/entities';
import { OrderController } from './order.controller';
import { OrderFeController } from './controllers/order.fe.controller';
import { OrderService } from './order.service';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), CustomerModule],
  controllers: [OrderController, OrderFeController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

