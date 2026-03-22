import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, Product, Section, SectionItem } from 'src/database/entities';
import { SectionService } from './section.service';
import { SectionFeController } from './controllers/section.fe.controller';
import { SectionCmsController } from './controllers/section.cms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Section, SectionItem, Product, Post])],
  controllers: [SectionFeController, SectionCmsController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
