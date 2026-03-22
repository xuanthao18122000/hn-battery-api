import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, UpdateCartDto } from './dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giỏ hàng mới' })
  async createCart() {
    const cart = await this.cartService.createCart();
    return { cartId: cart.id, cart };
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Lấy giỏ hàng' })
  async getCart(@Param('cartId', ParseIntPipe) cartId: number) {
    return this.cartService.getCart(cartId);
  }

  @Get(':cartId/count')
  @ApiOperation({ summary: 'Lấy số lượng items trong giỏ' })
  async getCartCount(@Param('cartId', ParseIntPipe) cartId: number) {
    const count = await this.cartService.getCartCount(cartId);
    return { count };
  }

  @Get(':cartId/validate')
  @ApiOperation({ summary: 'Kiểm tra tồn kho trước khi checkout' })
  async validateCart(@Param('cartId', ParseIntPipe) cartId: number) {
    return this.cartService.validateCartStock(cartId);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  async addToCart(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(cartId, addToCartDto);
  }

  @Put(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Cập nhật số lượng item trong giỏ' })
  async updateCartItem(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartId, itemId, updateDto);
  }

  @Delete(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Xóa item khỏi giỏ hàng' })
  async removeCartItem(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeCartItem(cartId, itemId);
  }

  @Delete(':cartId/clear')
  @ApiOperation({ summary: 'Xóa tất cả items trong giỏ' })
  async clearCart(@Param('cartId', ParseIntPipe) cartId: number) {
    await this.cartService.clearCart(cartId);
    return { message: 'Đã xóa giỏ hàng' };
  }

  @Put(':cartId')
  @ApiOperation({ summary: 'Cập nhật ghi chú giỏ hàng' })
  async updateCart(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body() updateDto: UpdateCartDto,
  ) {
    return this.cartService.updateCart(cartId, updateDto);
  }
}
