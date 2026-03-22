import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableContactInfos1768732264073 implements MigrationInterface {
    name = 'CreateTableContactInfos1768732264073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contact_informations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL COMMENT 'Tên người liên hệ', \`phone\` varchar(20) NOT NULL COMMENT 'Số điện thoại', \`email\` varchar(255) NOT NULL COMMENT 'Email', \`message\` text NOT NULL COMMENT 'Nội dung tin nhắn', \`productId\` int NULL COMMENT 'ID sản phẩm liên quan (nếu có)', \`status\` varchar(50) NOT NULL COMMENT 'Trạng thái: new, contacted, completed, cancelled' DEFAULT 'new', \`notes\` text NULL COMMENT 'Ghi chú', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`contact_informations\``);
    }

}
