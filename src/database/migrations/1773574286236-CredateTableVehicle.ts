import { MigrationInterface, QueryRunner } from "typeorm";

export class CredateTableVehicle1773574286236 implements MigrationInterface {
    name = 'CredateTableVehicle1773574286236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_vehicles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productId\` int NOT NULL COMMENT 'ID sản phẩm', \`vehicleId\` int NOT NULL COMMENT 'ID xe', \`isPrimary\` tinyint NOT NULL COMMENT 'Đánh dấu xe chính' DEFAULT 0, \`displayOrder\` int NOT NULL COMMENT 'Thứ tự hiển thị trong danh sách xe' DEFAULT '0', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL COMMENT 'Tên hãng xe (Honda, Mazda, Toyota, etc.)', \`slug\` varchar(255) NOT NULL COMMENT 'Đường dẫn URL của xe', \`type\` tinyint NOT NULL COMMENT 'Loại xe: 1 = Moto (xe máy), 2 = Ô tô' DEFAULT '1', \`imageUrl\` varchar(500) NULL COMMENT 'Ảnh đại diện xe', \`description\` text NULL COMMENT 'Mô tả về xe', \`priority\` int NOT NULL COMMENT 'Độ ưu tiên hiển thị' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt' DEFAULT '1', \`deleted\` tinyint NOT NULL COMMENT 'Trạng thái xóa' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_919490212957a3c9e8068dc9f0\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicle_brands\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL COMMENT 'Tên hãng xe (Honda, Mazda, Toyota, Hyundai, etc.)', \`slug\` varchar(255) NOT NULL COMMENT 'Slug của hãng xe (honda, mazda, toyota, etc.)', \`logoUrl\` varchar(500) NULL COMMENT 'Logo hãng xe', \`description\` text NULL COMMENT 'Mô tả về hãng xe', \`priority\` int NOT NULL COMMENT 'Độ ưu tiên hiển thị' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt' DEFAULT '1', \`deleted\` tinyint NOT NULL COMMENT 'Trạng thái xóa' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d7a9a7fe16791a075d6c4f9bf5\` (\`name\`), UNIQUE INDEX \`IDX_da19e7b886c6bc744c6d2bf1f0\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_da19e7b886c6bc744c6d2bf1f0\` ON \`vehicle_brands\``);
        await queryRunner.query(`DROP INDEX \`IDX_d7a9a7fe16791a075d6c4f9bf5\` ON \`vehicle_brands\``);
        await queryRunner.query(`DROP TABLE \`vehicle_brands\``);
        await queryRunner.query(`DROP INDEX \`IDX_919490212957a3c9e8068dc9f0\` ON \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`product_vehicles\``);
    }

}
