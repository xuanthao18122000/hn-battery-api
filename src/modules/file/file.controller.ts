import {
    Controller,
    Post,
    Put,
    UseInterceptors,
    Get,
    Param,
    ParseIntPipe,
    Req,
    Body,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FileService } from "./file.service";
import { UploadFileDto, RemoveFileDto, RemoveFilesDto } from "./dto";
import { Request } from "express";
import { FilesValidationInterceptor, FileValidationInterceptor } from "src/interceptors";

interface RequestWithFiles extends Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
}

@ApiBearerAuth()
@ApiTags("[Files] Quản lý file")
@Controller("cms/files")
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post("upload")
    @ApiOperation({ summary: "Upload một file hình ảnh" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                    description: "File hình ảnh cần upload",
                },
                object: {
                    type: "string",
                    description: "Object name",
                    example: "product",
                },
                object_id: {
                    type: "string",
                    description: "Object ID",
                    example: "123",
                },
                object_type: {
                    type: "string",
                    description: "Object type",
                    example: "",
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor("file"), new FileValidationInterceptor(true))
    async upload(@Req() request: RequestWithFiles, @Body() data: UploadFileDto) {
        const file = request.file;
        return await this.fileService.uploadFile(file, data);
    }

    @Post("uploads")
    @ApiOperation({ summary: "Upload nhiều files" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                files: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary",
                    },
                    description: "Danh sách file hình ảnh cần upload",
                },
                object: {
                    type: "string",
                    description: "Object name",
                    example: "product",
                },
                object_id: {
                    type: "string",
                    description: "Object ID",
                    example: "123",
                },
                object_type: {
                    type: "string",
                    description: "Object type",
                    example: "",
                },
            },
        },
    })
    @UseInterceptors(FilesInterceptor("files"), new FilesValidationInterceptor())
    async uploads(@Req() request: RequestWithFiles, @Body() data: UploadFileDto) {
        const files = request.files || [];
        return await this.fileService.uploadFiles(files, data);
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy thông tin file theo ID" })
    async findOne(@Param("id", ParseIntPipe) id: number) {
        return await this.fileService.findOne(id);
    }

    @Put("remove-file")
    @ApiOperation({ summary: "Xóa một file từ CDN server" })
    async removeFile(@Body() data: RemoveFileDto) {
        await this.fileService.removeFile(data.url);
        return { message: "Xóa file thành công" };
    }

    @Put("remove-files")
    @ApiOperation({ summary: "Xóa nhiều file từ CDN server" })
    async removeFiles(@Body() data: RemoveFilesDto) {
        await this.fileService.removeFiles(data.urls);
        return { message: "Xóa files thành công" };
    }
}
