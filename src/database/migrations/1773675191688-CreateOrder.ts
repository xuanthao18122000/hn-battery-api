import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrder1773675191688 implements MigrationInterface {
    name = 'CreateOrder1773675191688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`code\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`code\` varchar(50) NOT NULL COMMENT 'Mã đơn hàng hiển thị cho khách (ví dụ: 11344)'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` ON \`orders\` (\`code\`)`);
    }

}
