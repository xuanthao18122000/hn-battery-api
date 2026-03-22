import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1773670649269 implements MigrationInterface {
    name = 'Update1773670649269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`message\` \`address\` text NOT NULL COMMENT 'Nội dung tin nhắn'`);
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`address\` \`address\` text NULL COMMENT 'Địa chỉ'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`address\` \`address\` text NOT NULL COMMENT 'Nội dung tin nhắn'`);
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`address\` \`message\` text NOT NULL COMMENT 'Nội dung tin nhắn'`);
    }

}
