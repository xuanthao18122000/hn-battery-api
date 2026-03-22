import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryCmsController } from './controllers/category.cms.controller';
import { CategoryFeController } from './controllers/category.fe.controller';
import { CategoryService } from './category.service';
import { CategorySeedService } from './category.seed.service';
import { Category } from 'src/database/entities';
import { ProductModule } from '../product/product.module';
import { SlugModule } from '../slug/slug.module';
import { BrandModule } from '../brand/brand.module';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ProductModule,
    SlugModule,
    BrandModule,
    VehicleModule,
  ],
  controllers: [CategoryCmsController, CategoryFeController],
  providers: [CategoryService, CategorySeedService],
  exports: [CategoryService, CategorySeedService],
})
export class CategoryModule {}

