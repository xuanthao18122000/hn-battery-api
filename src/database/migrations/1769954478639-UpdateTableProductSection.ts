import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableProductSection1769954478639 implements MigrationInterface {
    name = 'UpdateTableProductSection1769954478639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_sections\` ADD \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt (StatusCommon: 1=ACTIVE, -1=INACTIVE)' DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_sections\` DROP COLUMN \`status\``);
    }

}
