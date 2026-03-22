import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddToCartDto, UpdateCartItemDto, UpdateCartDto } from './dto';
import { Cart, CartItem, Product } from 'src/database/entities';
import { ErrorCode } from 'src/constants';
import { CartStatusEnum } from 'src/database/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * @description: Tạo giỏ hàng mới
   */
  async createCart(): Promise<Cart> {
    const cart = this.cartRepo.create({
      totalAmount: 0,
      totalItems: 0,
      status: CartStatusEnum.ACTIVE,
    });

    return await this.cartRepo.save(cart);
  }

  /**
   * @description: Lấy giỏ hàng theo ID
   */
  async getCart(cartId: number): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId, status: CartStatusEnum.ACTIVE },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    return cart;
  }

  /**
   * @description: Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(
    cartId: number,
    addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    const { productId, quantity, selectedAttributes, note } = addToCartDto;

    // Kiểm tra sản phẩm tồn tại
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    // Kiểm tra tồn kho
    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Số lượng trong kho không đủ');
    }

    // Lấy giỏ hàng
    const cart = await this.getCart(cartId);

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    let cartItem = await this.cartItemRepo.findOne({
      where: { cartId: cart.id, productId },
    });

    // Lấy giá hiện tại (ưu tiên salePrice)
    const currentPrice = product.salePrice || product.price;

    if (cartItem) {
      // Cập nhật số lượng
      const newQuantity = cartItem.quantity + quantity;

      // Kiểm tra tồn kho với số lượng mới
      if (product.stockQuantity < newQuantity) {
        throw new BadRequestException('Số lượng trong kho không đủ');
      }

      cartItem.quantity = newQuantity;
      cartItem.price = currentPrice;
      cartItem.totalPrice = newQuantity * currentPrice;

      if (selectedAttributes) {
        cartItem.selectedAttributes = selectedAttributes;
      }
      if (note) {
        cartItem.note = note;
      }

      await this.cartItemRepo.save(cartItem);
    } else {
      // Thêm mới
      cartItem = this.cartItemRepo.create({
        cartId: cart.id,
        productId,
        quantity,
        price: currentPrice,
        totalPrice: quantity * currentPrice,
        selectedAttributes,
        note,
      });
      await this.cartItemRepo.save(cartItem);
    }

    // Cập nhật tổng giỏ hàng
    await this.recalculateCart(cart.id);

    return this.getCart(cartId);
  }

  /**
   * @description: Cập nhật số lượng item trong giỏ
   */
  async updateCartItem(
    cartId: number,
    itemId: number,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Kiểm tra tồn kho
    if (cartItem.product.stockQuantity < updateDto.quantity) {
      throw new BadRequestException('Số lượng trong kho không đủ');
    }

    cartItem.quantity = updateDto.quantity;
    cartItem.totalPrice = updateDto.quantity * cartItem.price;

    if (updateDto.selectedAttributes !== undefined) {
      cartItem.selectedAttributes = updateDto.selectedAttributes;
    }
    if (updateDto.note !== undefined) {
      cartItem.note = updateDto.note;
    }

    await this.cartItemRepo.save(cartItem);

    // Cập nhật tổng giỏ hàng
    await this.recalculateCart(cart.id);

    return this.getCart(cartId);
  }

  /**
   * @description: Xóa item khỏi giỏ hàng
   */
  async removeCartItem(cartId: number, itemId: number): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await this.cartItemRepo.remove(cartItem);

    // Cập nhật tổng giỏ hàng
    await this.recalculateCart(cart.id);

    return this.getCart(cartId);
  }

  /**
   * @description: Xóa tất cả item trong giỏ
   */
  async clearCart(cartId: number): Promise<void> {
    const cart = await this.getCart(cartId);

    await this.cartItemRepo.delete({ cartId: cart.id });

    cart.totalAmount = 0;
    cart.totalItems = 0;

    await this.cartRepo.save(cart);
  }

  /**
   * @description: Cập nhật thông tin giỏ hàng (note)
   */
  async updateCart(
    cartId: number,
    updateDto: UpdateCartDto,
  ): Promise<Cart> {
    const cart = await this.getCart(cartId);

    if (updateDto.note !== undefined) {
      cart.note = updateDto.note;
    }

    await this.cartRepo.save(cart);

    return this.getCart(cartId);
  }

  /**
   * @description: Tính lại tổng giỏ hàng
   */
  private async recalculateCart(cartId: number): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) return;

    let totalAmount = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      totalAmount += Number(item.totalPrice);
      totalItems += item.quantity;
    }

    cart.totalAmount = totalAmount;
    cart.totalItems = totalItems;

    await this.cartRepo.save(cart);
  }

  /**
   * @description: Lấy số lượng items trong giỏ
   */
  async getCartCount(cartId: number): Promise<number> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId, status: CartStatusEnum.ACTIVE },
    });

    return cart ? cart.totalItems : 0;
  }

  /**
   * @description: Kiểm tra tồn kho trước khi checkout
   */
  async validateCartStock(cartId: number): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const cart = await this.getCart(cartId);
    const errors: string[] = [];

    for (const item of cart.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push(`Sản phẩm ${item.productId} không còn tồn tại`);
        continue;
      }

      if (product.stockQuantity < item.quantity) {
        errors.push(
          `${product.name} chỉ còn ${product.stockQuantity} sản phẩm trong kho`,
        );
      }

      // Kiểm tra giá có thay đổi không
      const currentPrice = product.salePrice || product.price;
      if (Number(item.price) !== Number(currentPrice)) {
        errors.push(`Giá của ${product.name} đã thay đổi`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * @description: Đánh dấu giỏ hàng đã hoàn thành (sau khi đặt hàng)
   */
  async completeCart(cartId: number): Promise<void> {
    const cart = await this.getCart(cartId);
    cart.status = CartStatusEnum.COMPLETED;
    await this.cartRepo.save(cart);
  }
}

