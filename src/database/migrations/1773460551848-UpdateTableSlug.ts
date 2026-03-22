import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableSlug1773460551848 implements MigrationInterface {
    name = 'UpdateTableSlug1773460551848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`type\` tinyint NOT NULL COMMENT 'Loại: 1 = Danh mục (sản phẩm), 2 = Bài viết' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`type\` tinyint NOT NULL COMMENT 'Loại: 1 = Bài viết, 2 = Dịch vụ' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`slugs\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`slugs\` ADD \`type\` tinyint NOT NULL COMMENT 'Loại slug' DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`slugs\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`slugs\` ADD \`type\` enum ('PRODUCT', 'CATEGORY', 'POST') NOT NULL COMMENT 'Loại slug'`);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`type\``);
        await queryRunner.query(`DROP INDEX \`IDX_da19e7b886c6bc744c6d2bf1f0\` ON \`vehicle_brands\``);
        await queryRunner.query(`DROP INDEX \`IDX_d7a9a7fe16791a075d6c4f9bf5\` ON \`vehicle_brands\``);
        await queryRunner.query(`DROP TABLE \`vehicle_brands\``);
        await queryRunner.query(`DROP INDEX \`IDX_919490212957a3c9e8068dc9f0\` ON \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`vehicles\``);
        await queryRunner.query(`DROP INDEX \`IDX_df2d9d4b9c746c864a488fddb2\` ON \`product_vehicles\``);
        await queryRunner.query(`DROP TABLE \`product_vehicles\``);
    }

}
