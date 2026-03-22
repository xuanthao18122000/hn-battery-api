import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableSections1773561820299 implements MigrationInterface {
    name = 'UpdateTableSections1773561820299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`category\` \`categoryId\` varchar(100) NULL COMMENT 'Danh mục bài viết'`);
        await queryRunner.query(`CREATE TABLE \`section_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sectionId\` int NOT NULL COMMENT 'ID block', \`refId\` int NOT NULL COMMENT 'ID item tham chiếu (product/post...)', \`position\` int NOT NULL COMMENT 'Thứ tự SP trong block (số nhỏ hiển thị trước)' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sections\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` tinyint NOT NULL COMMENT 'Loại block: 1 = Sản phẩm, 2 = Bài viết' DEFAULT '1', \`name\` varchar(255) NOT NULL COMMENT 'Tên block (vd: TOP Sản Phẩm Ắc Quy Bán Chạy)', \`code\` varchar(100) NOT NULL COMMENT 'Code dùng cho API (vd: top-ban-chay, noi-bat)', \`page\` varchar(50) NOT NULL COMMENT 'Trang hiển thị (vd: home)' DEFAULT 'home', \`dataSource\` tinyint NOT NULL COMMENT 'Nguồn dữ liệu: 1 = Chọn tay, 2 = Mới nhất' DEFAULT '1', \`dataLimit\` int NOT NULL COMMENT 'Số lượng item tối đa hiển thị trong block' DEFAULT '4', \`position\` int NOT NULL COMMENT 'Thứ tự block trên trang (số nhỏ hiển thị trước)' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt (StatusCommon: 1=ACTIVE, -1=INACTIVE)' DEFAULT '1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`categoryId\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`categoryId\` int NULL COMMENT 'ID danh mục bài viết (categories.type = POST)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`categoryId\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`categoryId\` varchar(100) NULL COMMENT 'Danh mục bài viết'`);
        await queryRunner.query(`DROP TABLE \`sections\``);
        await queryRunner.query(`DROP TABLE \`section_items\``);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`categoryId\` \`category\` varchar(100) NULL COMMENT 'Danh mục bài viết'`);
    }

}
