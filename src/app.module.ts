import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/database.config';
import { LoggerModule } from './loggers/logger.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ErrorLoggerService } from './services/error-logger.service';
import { Logger } from './loggers/logger.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { CategoryModule } from './modules/category/category.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { PostModule } from './modules/post/post.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { ContactInformationModule } from './modules/contact-information/contact-information.module';
import { CommonModule } from './modules/common/common.module';
import { SlugModule } from './modules/slug/slug.module';
import { SectionModule } from './modules/section/section.module';
import { CacheModule } from './modules/cache/cache.module';
import { BrandModule } from './modules/brand/brand.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { BatteryCapacityModule } from './modules/battery-capacity/battery-capacity.module';
import { OrderModule } from './modules/order/order.module';
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    LoggerModule,
    RedisModule,
    AuthModule,
    UserModule,
    NotificationModule,
    FileModule,
    CategoryModule,
    ProductModule,
    CartModule,
    PostModule,
    HomepageModule,
    ContactInformationModule,
    CommonModule,
    SlugModule,
    SectionModule,
    CacheModule,
    BrandModule,
    VehicleModule,
    BatteryCapacityModule,
    OrderModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorLoggerService, Logger],
})
export class AppModule {}
