import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DATE_DB_FORMAT, DATETIME_FORMAT } from 'src/constants';
import { ToEndOfDay, ToStartOfDay, ToTrimCustom } from 'src/decorators';
import { IsDateCustom } from 'src/decorators/validation.decorators';
import { PaginationOptionsDto } from 'src/dto/pagination-query';

import {
  NotificationCategoryEnum,
  NotificationRedirectTypeEnum,
  NotificationTypeReceiverEnum,
} from 'src/enums';
import { getCurrentTimeAsString } from 'src/helpers';

export class CreateNotificationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsEnum(NotificationRedirectTypeEnum)
  @IsNotEmpty()
  redirectType: NotificationRedirectTypeEnum;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityRefId: string;

  @ApiProperty({
    required: false,
    description:
      'Category = ' + JSON.stringify(NotificationCategoryEnum, null, 1),
    enum: NotificationCategoryEnum,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsEnum(NotificationCategoryEnum)
  category: number;

  @ApiProperty({
    required: false,
    description:
      'Type Receiver = ' +
      JSON.stringify(NotificationTypeReceiverEnum, null, 1),
    enum: NotificationTypeReceiverEnum,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsEnum(NotificationTypeReceiverEnum)
  receiverType: number;

  @ApiProperty({
    required: false,
    example: [],
  })
  @IsArray()
  @IsOptional()
  userIds: number[] = [];
}

export class ListNotificationDto extends PaginationOptionsDto {
  @ApiProperty({
    required: false,
    description:
      'Category = ' + JSON.stringify(NotificationCategoryEnum, null, 1),
    enum: NotificationCategoryEnum,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(NotificationCategoryEnum)
  category: number;

  @ApiProperty({
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  seen?: boolean;

  @ApiProperty({
    description: `Từ ngày (format ${DATE_DB_FORMAT})`,
    type: 'string',
    example: getCurrentTimeAsString(DATE_DB_FORMAT),
    required: false,
  })
  @IsOptional()
  @ToStartOfDay()
  @IsDateCustom({ format: DATETIME_FORMAT })
  fromDate?: string;

  @ApiProperty({
    description: `Đến ngày (format ${DATE_DB_FORMAT})`,
    type: 'string',
    example: getCurrentTimeAsString(DATE_DB_FORMAT),
    required: false,
  })
  @IsOptional()
  @ToEndOfDay()
  @IsDateCustom({ format: DATETIME_FORMAT })
  toDate?: string;

  @ApiProperty({
    description: `Tìm theo tên thông báo`,
    type: 'string',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ToTrimCustom()
  title?: string;
}
