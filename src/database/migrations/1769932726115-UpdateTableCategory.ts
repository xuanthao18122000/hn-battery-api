import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableCategory1769932726115 implements MigrationInterface {
    name = 'UpdateTableCategory1769932726115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`position\` int NOT NULL COMMENT 'Vị trí sắp xếp (số nhỏ hiển thị trước)' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`position\``);
    }

}
