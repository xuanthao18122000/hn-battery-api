import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityIdToSlugs1774200000000 implements MigrationInterface {
    name = 'AddEntityIdToSlugs1774200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`slugs\` ADD \`entityId\` int NULL COMMENT 'ID của entity tương ứng (product/category/post)'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`slugs\` DROP COLUMN \`entityId\``);
    }
}
