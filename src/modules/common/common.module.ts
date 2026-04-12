import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResolveController } from './controllers/resolve.controller';
import { SlugModule } from '../slug/slug.module';
import { Product, Category, Post } from 'src/database/entities';

@Module({
  imports: [
    SlugModule,
    TypeOrmModule.forFeature([Product, Category, Post]),
  ],
  controllers: [ResolveController],
})
export class CommonModule {}
