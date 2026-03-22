import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTablePost1773585970517 implements MigrationInterface {
    name = 'UpdateTablePost1773585970517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`shortDescription\` text NULL COMMENT 'Mô tả ngắn / tóm tắt bài viết'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`shortDescription\``);
    }

}
