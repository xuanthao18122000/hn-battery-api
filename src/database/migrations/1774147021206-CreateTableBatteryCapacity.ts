import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableBatteryCapacity1774147021206 implements MigrationInterface {
    name = 'CreateTableBatteryCapacity1774147021206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`battery_capacities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(32) NOT NULL COMMENT 'Hiển thị: 60Ah, 100Ah, ...', \`position\` int NOT NULL COMMENT 'Thứ tự sắp xếp (nhỏ trước)' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT 'Trạng thái' DEFAULT '1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`batteryCapacityId\` int NULL COMMENT 'ID dung lượng ắc quy (battery_capacities.id) — filter WHERE, không cần join'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`batteryCapacityId\``);
        await queryRunner.query(`DROP TABLE \`battery_capacities\``);
    }

}
