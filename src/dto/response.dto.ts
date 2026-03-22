import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: 'Mã trạng thái', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Thông báo', example: 'Thành công' })
  message: string;

  @ApiProperty({ description: 'Dữ liệu trả về' })
  data: T;
}
