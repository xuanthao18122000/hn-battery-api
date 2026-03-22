import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from "class-validator";

export class RemoveFileDto {
    @ApiProperty({
        description: "URL của file cần xóa",
        example: "files/stickers/2025/10/6/1/logo-ddv-3.jpeg",
    })
    @IsNotEmpty()
    @IsString()
    url: string;
}

export class RemoveFilesDto {
    @ApiProperty({
        description: "Danh sách URL của các file cần xóa",
        example: [
            "files/stickers/2025/10/6/1/logo-ddv-3.jpeg",
            "files/stickers/2025/10/6/1/image-2.png",
        ],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    urls: string[];
}
