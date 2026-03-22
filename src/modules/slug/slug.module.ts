import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlugCmsController } from './controllers/slug.cms.controller';
import { SlugFeController } from './controllers/slug.fe.controller';
import { SlugService } from './slug.service';
import { Slug } from 'src/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Slug])],
  controllers: [SlugCmsController, SlugFeController],
  providers: [SlugService],
  exports: [SlugService],
})
export class SlugModule {}
