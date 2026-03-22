import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProductVehiclesTable1774000000000 implements MigrationInterface {
  name = 'DropProductVehiclesTable1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`product_vehicles\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`product_vehicles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`productId\` int NOT NULL COMMENT 'ID sản phẩm',
        \`vehicleId\` int NOT NULL COMMENT 'ID xe',
        \`isPrimary\` tinyint NOT NULL COMMENT 'Đánh dấu xe chính' DEFAULT 0,
        \`displayOrder\` int NOT NULL COMMENT 'Thứ tự hiển thị trong danh sách xe' DEFAULT '0',
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }
}
