import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class HomepageService {
  private readonly configPath = join(
    __dirname,
    '..',
    '..',
    'configs',
    'homepage.json',
  );

  /**
   * @description: Lấy cấu hình homepage
   */
  async getConfig() {
    try {
      const config = readFileSync(this.configPath, 'utf-8');
      return JSON.parse(config);
    } catch (error) {
      return { sections: [] };
    }
  }

  /**
   * @description: Cập nhật cấu hình homepage
   */
  async updateConfig(config: any) {
    try {
      // Validate config structure
      if (!config.sections || !Array.isArray(config.sections)) {
        throw new Error('Invalid config structure');
      }

      writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      return { message: 'Cập nhật cấu hình thành công', config };
    } catch (error) {
      throw error;
    }
  }
}
