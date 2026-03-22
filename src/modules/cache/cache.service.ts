import { Injectable } from '@nestjs/common';

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache với TTL (time-to-live).
 * Dùng cho dữ liệu đọc nhiều, ít thay đổi (vd: category tree).
 */
@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry>();
  private readonly defaultTtlMs = 5 * 60 * 1000; // 5 phút

  /**
   * Lấy giá trị từ cache. Trả về undefined nếu không tồn tại hoặc đã hết hạn.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Ghi giá trị vào cache với TTL tùy chọn (ms).
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Xóa một key khỏi cache (invalidate).
   */
  del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Xóa tất cả key có prefix (vd: invalidate toàn bộ cache category tree).
   */
  delByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /**
   * Lấy từ cache hoặc gọi factory rồi set vào cache. Tiện cho controller.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }
}
