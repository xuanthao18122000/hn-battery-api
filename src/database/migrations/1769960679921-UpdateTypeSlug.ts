import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypeSlug1769960679921 implements MigrationInterface {
    name = 'UpdateTypeSlug1769960679921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`excerpt\``);
        await queryRunner.query(`ALTER TABLE \`slugs\` CHANGE \`type\` \`type\` enum ('PRODUCT', 'CATEGORY', 'POST') NOT NULL COMMENT 'Loại slug'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`slugs\` CHANGE \`type\` \`type\` enum ('PRODUCT', 'CATEGORY') NOT NULL COMMENT 'Loại slug'`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`excerpt\` text NULL COMMENT 'Mô tả ngắn/trích dẫn'`);
    }

}
