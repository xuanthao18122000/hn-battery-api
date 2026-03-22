import { Module, forwardRef } from '@nestjs/common';
import { ResolveController } from './controllers/resolve.controller';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { SlugModule } from '../slug/slug.module';

@Module({
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => ProductModule),
    SlugModule,
  ],
  controllers: [ResolveController],
})
export class CommonModule {}
