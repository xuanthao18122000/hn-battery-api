import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableCustomer1776520708568 implements MigrationInterface {
    name = 'CreateTableCustomer1776520708568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`customers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL COMMENT 'Tên khách hàng', \`phone\` varchar(20) NOT NULL COMMENT 'Số điện thoại (định danh khách hàng)', \`email\` varchar(255) NULL COMMENT 'Email khách hàng', \`address\` text NULL COMMENT 'Địa chỉ gần nhất của khách', \`totalOrders\` int NOT NULL COMMENT 'Tổng số đơn đã đặt' DEFAULT '0', \`totalSpent\` decimal(15,2) NOT NULL COMMENT 'Tổng tiền đã chi tiêu' DEFAULT '0.00', \`lastOrderedAt\` datetime NULL COMMENT 'Thời điểm đặt đơn gần nhất', \`status\` tinyint NOT NULL COMMENT 'Trạng thái bật/tắt' DEFAULT '1', \`deleted\` tinyint NOT NULL COMMENT 'Trạng thái xóa' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`customerId\` int NOT NULL COMMENT 'FK tới customers.id'`);
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`email\` \`email\` varchar(255) NULL COMMENT 'Email'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact_informations\` CHANGE \`email\` \`email\` varchar(255) NOT NULL COMMENT 'Email'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`customerId\``);
        await queryRunner.query(`DROP INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
    }

}
