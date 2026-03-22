import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableProduct1769930163460 implements MigrationInterface {
    name = 'UpdateTableProduct1769930163460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`showPrice\` tinyint NOT NULL COMMENT 'Hiển thị giá (false = hiện Liên hệ)' DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`showPrice\``);
    }

}
