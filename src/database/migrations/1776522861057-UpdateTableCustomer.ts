import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableCustomer1776522861057 implements MigrationInterface {
    name = 'UpdateTableCustomer1776522861057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e5de51ca888d8b1f5ac25799dd\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_1a0a8ea3e6eec9411788d0d597\` ON \`contact_informations\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_1a0a8ea3e6eec9411788d0d597\` ON \`contact_informations\` (\`customerId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e5de51ca888d8b1f5ac25799dd\` ON \`orders\` (\`customerId\`)`);
    }

}
