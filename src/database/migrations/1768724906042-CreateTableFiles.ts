import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableFiles1768724906042 implements MigrationInterface {
    name = 'CreateTableFiles1768724906042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`files\` (\`id\` int NOT NULL AUTO_INCREMENT, \`originalName\` varchar(500) NOT NULL COMMENT 'Tên file gốc', \`fileName\` varchar(500) NOT NULL COMMENT 'Tên file đã lưu', \`path\` varchar(500) NOT NULL COMMENT 'Đường dẫn file', \`mimeType\` varchar(100) NOT NULL COMMENT 'MIME type của file', \`size\` bigint NOT NULL COMMENT 'Kích thước file (bytes)', \`fileType\` varchar(50) NULL COMMENT 'Loại file (image, document, etc.)', \`isUsed\` tinyint NOT NULL COMMENT 'Đánh dấu file đang được sử dụng' DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`files\``);
    }

}
