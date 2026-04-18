import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UploadFileDto {
    @ApiProperty({ description: "Object name", example: "product" })
    @IsString()
    object: string;

    @ApiProperty({ description: "Object ID", example: "123", required: false })
    @IsOptional()
    @IsString()
    object_id?: string;

    @ApiProperty({ description: "Object type", example: "image", required: false })
    @IsOptional()
    @IsString()
    object_type?: string;
}
