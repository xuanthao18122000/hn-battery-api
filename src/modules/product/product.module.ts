import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductFeController } from './controllers/product.fe.controller';
import { ProductService } from './product.service';
import { ProductSeedService } from './product.seed.service';
import { Category, Product, ProductCategory } from 'src/database/entities';
import { SlugModule } from '../slug/slug.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory, Category]),
    SlugModule,
  ],
  controllers: [ProductController, ProductFeController],
  providers: [ProductService, ProductSeedService],
  exports: [ProductService],
})
export class ProductModule {}

