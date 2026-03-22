import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableBrand1773154921031 implements MigrationInterface {
    name = 'CreateTableBrand1773154921031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`brand\` \`brandId\` varchar(255) NULL COMMENT 'Thương hiệu'`);
        await queryRunner.query(`CREATE TABLE \`brands\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL COMMENT 'Tên thương hiệu (GS, Đồng Nai, Varta, ...)', \`slug\` varchar(255) NOT NULL COMMENT 'Slug thương hiệu (gs, dong-nai, varta, ...)', \`logoUrl\` varchar(500) NULL COMMENT 'Logo thương hiệu', \`description\` text NULL COMMENT 'Mô tả thương hiệu', \`priority\` int NOT NULL COMMENT 'Độ ưu tiên hiển thị' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt' DEFAULT '1', \`deleted\` tinyint NOT NULL COMMENT 'Trạng thái xóa' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_96db6bbbaa6f23cad26871339b\` (\`name\`), UNIQUE INDEX \`IDX_b15428f362be2200922952dc26\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`brandId\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`brandId\` int NULL COMMENT 'ID thương hiệu (brands.id)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`brandId\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`brandId\` varchar(255) NULL COMMENT 'Thương hiệu'`);
        await queryRunner.query(`DROP INDEX \`IDX_b15428f362be2200922952dc26\` ON \`brands\``);
        await queryRunner.query(`DROP INDEX \`IDX_96db6bbbaa6f23cad26871339b\` ON \`brands\``);
        await queryRunner.query(`DROP TABLE \`brands\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`brandId\` \`brand\` varchar(255) NULL COMMENT 'Thương hiệu'`);
    }

}
