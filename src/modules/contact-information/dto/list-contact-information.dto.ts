import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { ContactStatusEnum } from 'src/database/entities/contact-information.entity';

export class ListContactInformationDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tìm kiếm theo tên, email, số điện thoại',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Trạng thái',
    enum: ContactStatusEnum,
    required: false,
  })
  @IsEnum(ContactStatusEnum)
  @IsOptional()
  status?: ContactStatusEnum;
}
