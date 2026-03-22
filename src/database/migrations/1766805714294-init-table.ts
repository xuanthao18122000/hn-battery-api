import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTable1766805714294 implements MigrationInterface {
    name = 'InitTable1766805714294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL COMMENT 'Tiêu đề bài viết', \`slug\` varchar(255) NOT NULL COMMENT 'Đường dẫn URL của bài viết', \`excerpt\` text NULL COMMENT 'Mô tả ngắn/trích dẫn', \`content\` longtext NULL COMMENT 'Nội dung đầy đủ của bài viết (HTML)', \`featuredImage\` varchar(500) NULL COMMENT 'Ảnh đại diện bài viết', \`category\` varchar(100) NULL COMMENT 'Danh mục bài viết', \`views\` int NOT NULL COMMENT 'Số lượt xem' DEFAULT '0', \`authorId\` int NULL COMMENT 'ID tác giả', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt' DEFAULT '1', \`deleted\` tinyint NOT NULL COMMENT 'Trạng thái xóa' DEFAULT '0', \`publishedAt\` datetime NULL COMMENT 'Ngày xuất bản', \`metaTitle\` varchar(255) NULL COMMENT 'Meta title cho SEO', \`metaDescription\` text NULL COMMENT 'Meta description cho SEO', \`metaKeywords\` varchar(500) NULL COMMENT 'SEO keywords', \`createdBy\` int NULL COMMENT 'ID người tạo', \`updatedBy\` int NULL COMMENT 'ID người cập nhật', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_54ddf9075260407dcfdd724857\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_54ddf9075260407dcfdd724857\` ON \`posts\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
    }

}
