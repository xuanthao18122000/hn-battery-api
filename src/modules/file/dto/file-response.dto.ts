import { ApiProperty } from "@nestjs/swagger";

export class FileResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    originalName: string;

    @ApiProperty()
    fileName: string;

    @ApiProperty()
    path: string;

    @ApiProperty()
    mimeType: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    fileType?: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}
