import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getEnv } from 'src/configs/env.config';
import { Order } from 'src/database/entities/order.entity';
import { PaymentMethodEnum } from 'src/database/entities/order.entity';

const TELEGRAM_API = 'https://api.telegram.org';

@Injectable()
export class TelegramService {
  private readonly botToken: string | undefined;
  private readonly chatId: string | undefined;

  constructor() {
    this.botToken = getEnv<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = getEnv<string>('TELEGRAM_CHAT_ID');
  }

  isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.botToken || !this.chatId) return;
    const url = `${TELEGRAM_API}/bot${this.botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }

  /**
   * Gửi thông báo đơn hàng mới (fire-and-forget, lỗi không ảnh hưởng API).
   */
  sendOrderNotification(order: Order): void {
    if (!this.isConfigured()) return;
    const text = this.formatOrderMessage(order);
    this.sendMessage(text).catch(() => {
      // Bỏ qua lỗi để không ảnh hưởng response tạo đơn
    });
  }

  private formatOrderMessage(order: Order): string {
    const code = (order as { code?: string }).code ?? `#${order.id}`;
    const paymentLabel =
      order.paymentMethod === PaymentMethodEnum.COD
        ? 'COD'
        : order.paymentMethod === PaymentMethodEnum.BANK_TRANSFER
          ? 'Chuyển khoản'
          : 'Khác';
    const total = Number(order.totalAmount);
    const totalFormatted = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(total);
    const createdAt = order.createdAt
      ? formatDateDDMMYYYY(new Date(order.createdAt))
      : '—';

    let lines: string[] = [
      '📦 <b>Đơn hàng mới</b>',
      '',
      `<b>Mã đơn:</b> ${escapeHtml(String(code))}`,
      `<b>Thời gian:</b> ${createdAt}`,
      `<b>Khách hàng:</b> ${escapeHtml(order.customerName)}`,
      `<b>SĐT:</b> ${escapeHtml(order.phone)}`,
      `<b>Email:</b> ${escapeHtml(order.email)}`,
      `<b>Địa chỉ:</b> ${escapeHtml(order.shippingAddress)}`,
      `<b>Thanh toán:</b> ${paymentLabel}`,
      `<b>Tổng tiền:</b> ${totalFormatted}`,
    ];
    if (order.note) {
      lines.push(`<b>Ghi chú:</b> ${escapeHtml(order.note)}`);
    }
    if (order.items?.length) {
      lines.push('');
      lines.push('<b>Chi tiết:</b>');
      for (const item of order.items) {
        const name = escapeHtml(String(item.productName));
        const qty = item.quantity;
        const price = new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(Number(item.unitPrice));
        lines.push(` • ${name} x ${qty} — ${price}`);
      }
    }
    return lines.join('\n');
  }
}

function formatDateDDMMYYYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${h}:${m}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
