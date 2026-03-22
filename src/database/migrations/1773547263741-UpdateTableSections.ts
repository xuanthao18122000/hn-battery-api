import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableSections1773547263741 implements MigrationInterface {
    name = 'UpdateTableSections1773547263741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`product_sections\` ADD \`type\` tinyint NOT NULL COMMENT 'Loại block: 1 = Sản phẩm, 2 = Bài viết' DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_sections\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`type\` tinyint NOT NULL COMMENT 'Loại: 1 = Bài viết, 2 = Dịch vụ' DEFAULT '1'`);
    }

}
