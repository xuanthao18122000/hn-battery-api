import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostFeController } from './controllers/post.fe.controller';
import { PostService } from './post.service';
import { Post } from 'src/database/entities';
import { SlugModule } from '../slug/slug.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), SlugModule],
  controllers: [PostController, PostFeController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

