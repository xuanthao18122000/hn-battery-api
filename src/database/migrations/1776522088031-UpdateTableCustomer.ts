import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableCustomer1776522088031 implements MigrationInterface {
    name = 'UpdateTableCustomer1776522088031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` ON \`customers\``);
        await queryRunner.query(`ALTER TABLE \`contact_informations\` ADD \`customerId\` int NOT NULL COMMENT 'FK tới customers.id'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`phone\` \`phone\` varchar(20) NOT NULL COMMENT 'Số điện thoại (định danh khách hàng, unique)'`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD UNIQUE INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` (\`phone\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e5de51ca888d8b1f5ac25799dd\` ON \`orders\` (\`customerId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1a0a8ea3e6eec9411788d0d597\` ON \`contact_informations\` (\`customerId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_1a0a8ea3e6eec9411788d0d597\` ON \`contact_informations\``);
        await queryRunner.query(`DROP INDEX \`IDX_e5de51ca888d8b1f5ac25799dd\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP INDEX \`IDX_88acd889fbe17d0e16cc4bc917\``);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`phone\` \`phone\` varchar(20) NOT NULL COMMENT 'Số điện thoại (định danh khách hàng)'`);
        await queryRunner.query(`ALTER TABLE \`contact_informations\` DROP COLUMN \`customerId\``);
        await queryRunner.query(`CREATE INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` ON \`customers\` (\`phone\`)`);
    }

}
