import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrder1773675127434 implements MigrationInterface {
    name = 'CreateOrder1773675127434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` int NOT NULL COMMENT 'ID đơn hàng', \`productId\` int NOT NULL COMMENT 'ID sản phẩm', \`productName\` varchar(255) NOT NULL COMMENT 'Tên sản phẩm tại thời điểm đặt hàng', \`productSlug\` varchar(255) NULL COMMENT 'Slug sản phẩm tại thời điểm đặt hàng', \`quantity\` int NOT NULL COMMENT 'Số lượng' DEFAULT '1', \`unitPrice\` decimal(15,2) NOT NULL COMMENT 'Đơn giá tại thời điểm đặt hàng', \`totalPrice\` decimal(15,2) NOT NULL COMMENT 'Thành tiền (quantity * unitPrice)' DEFAULT '0.00', \`selectedAttributes\` json NULL COMMENT 'Thuộc tính đã chọn (màu sắc, size, cấu hình...)', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(50) NOT NULL COMMENT 'Mã đơn hàng hiển thị cho khách (ví dụ: 11344)', \`customerName\` varchar(255) NOT NULL COMMENT 'Tên khách hàng', \`phone\` varchar(20) NOT NULL COMMENT 'Số điện thoại', \`email\` varchar(255) NOT NULL COMMENT 'Email', \`shippingAddress\` text NOT NULL COMMENT 'Địa chỉ giao hàng', \`note\` text NULL COMMENT 'Ghi chú của khách hàng', \`totalAmount\` decimal(15,2) NOT NULL COMMENT 'Tổng tiền đơn hàng' DEFAULT '0.00', \`status\` tinyint NOT NULL COMMENT 'Trạng thái đơn hàng: 1=new,2=confirmed,3=shipping,4=completed,5=cancelled' DEFAULT '1', \`paymentMethod\` tinyint NOT NULL COMMENT 'Phương thức thanh toán: 1=COD,2=chuyển khoản,3=khác' DEFAULT '1', \`confirmedAt\` datetime NULL COMMENT 'Thời gian xác nhận đơn', \`completedAt\` datetime NULL COMMENT 'Thời gian hoàn tất đơn', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
    }

}
