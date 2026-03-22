import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetOrderAutoIncrementFrom10000001773680000000 implements MigrationInterface {
  name = 'SetOrderAutoIncrementFrom10000001773680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` AUTO_INCREMENT = 1000000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không revert AUTO_INCREMENT về 1 — nếu đã có đơn id >= 1000000 sẽ dễ trùng ID.
    // Để hoàn tác thủ công: ALTER TABLE `orders` AUTO_INCREMENT = 1;
  }
}
