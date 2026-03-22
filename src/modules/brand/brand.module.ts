import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from 'src/database/entities';
import { BrandService } from './brand.service';
import { BrandCmsController } from './controllers/brand.cms.controller';
import { BrandFeController } from './controllers/brand.fe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandCmsController, BrandFeController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}

