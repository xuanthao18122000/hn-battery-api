import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableSections1773562778386 implements MigrationInterface {
    name = 'UpdateTableSections1773562778386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sections\` ADD \`productRows\` int NOT NULL COMMENT 'Số hàng sản phẩm (chỉ áp dụng khi type=PRODUCT)' DEFAULT '2'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sections\` DROP COLUMN \`productRows\``);
    }

}
