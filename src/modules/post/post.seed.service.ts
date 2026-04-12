import { Injectable } from '@nestjs/common';
import { PostService } from './post.service';
import { getMockPosts } from './mock-posts';

@Injectable()
export class PostSeedService {
  constructor(private readonly postService: PostService) {}

  /**
   * Seed bài viết từ `mock-posts.ts`.
   * Bỏ qua nếu slug đã tồn tại.
   */
  async seedFromMock() {
    const items = getMockPosts();

    let created = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; message: string }> = [];

    for (const item of items) {
      try {
        await this.postService.create(item);
        created += 1;
      } catch (err: any) {
        const message = err?.message || 'Unknown error';
        const msgLower = String(message).toLowerCase();
        const isDup =
          msgLower.includes('slug') || msgLower.includes('đã tồn tại');

        if (isDup) {
          skipped += 1;
          continue;
        }

        errors.push({ slug: item.slug, message });
      }
    }

    return { total: items.length, created, skipped, errors };
  }
}
