import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBatteryCapacitiesTable1774100000000
  implements MigrationInterface
{
  name = 'CreateBatteryCapacitiesTable1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE \`battery_capacities\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(32) NOT NULL COMMENT 'Hiển thị: 60Ah, 100Ah, ...',
  \`slug\` varchar(64) NOT NULL COMMENT 'Slug: 60ah',
  \`priority\` int NOT NULL DEFAULT '0' COMMENT 'Độ ưu tiên hiển thị',
  \`position\` int NOT NULL DEFAULT '0' COMMENT 'Thứ tự sắp xếp (nhỏ trước)',
  \`status\` tinyint NOT NULL DEFAULT '1' COMMENT 'Trạng thái',
  \`deleted\` tinyint NOT NULL DEFAULT '0' COMMENT 'Xóa mềm',
  \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`battery_capacities\``);
  }
}
