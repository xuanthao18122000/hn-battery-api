import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableProductSection1769934529256 implements MigrationInterface {
    name = 'CreateTableProductSection1769934529256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_sections\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL COMMENT 'Tên block (vd: TOP Sản Phẩm Ắc Quy Bán Chạy)', \`code\` varchar(100) NOT NULL COMMENT 'Code dùng cho API (vd: top-ban-chay, noi-bat)', \`page\` varchar(50) NOT NULL COMMENT 'Trang hiển thị (vd: home)' DEFAULT 'home', \`position\` int NOT NULL COMMENT 'Thứ tự block trên trang (số nhỏ hiển thị trước)' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_section_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sectionId\` int NOT NULL COMMENT 'ID block', \`productId\` int NOT NULL COMMENT 'ID sản phẩm', \`position\` int NOT NULL COMMENT 'Thứ tự SP trong block (số nhỏ hiển thị trước)' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`product_section_items\``);
        await queryRunner.query(`DROP TABLE \`product_sections\``);
    }

}
