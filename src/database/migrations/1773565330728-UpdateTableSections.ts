import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableSections1773565330728 implements MigrationInterface {
    name = 'UpdateTableSections1773565330728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sections\` DROP COLUMN \`dataLimit\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sections\` ADD \`dataLimit\` int NOT NULL COMMENT 'Số lượng item tối đa hiển thị trong block' DEFAULT '4'`);
    }

}
