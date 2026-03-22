import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableSlug1769009916752 implements MigrationInterface {
    name = 'CreateTableSlug1769009916752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`slugs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('PRODUCT', 'CATEGORY') NOT NULL COMMENT 'Loại slug', \`slug\` varchar(255) NOT NULL COMMENT 'slug của tất cả item', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8b7331581dd1b670d8a8d4ac42\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`slugs\``);
    }

}
