import { Injectable, BadRequestException, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { File } from "../../database/entities/file.entity";
import { UploadFileDto } from "./dto";
import { CDNConfig } from "../../configs/cdn.config";
import { getFileType, validateImageFile, safeStringify } from "../../helpers";
import axios, { AxiosError } from "axios";
import * as path from "path";
const FormDataLib = require("form-data");

// Type definition for Multer file
type MulterFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
};

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(File)
        private readonly fileRepo: Repository<File>,
    ) {}

    /**
     * @description: Upload single file lên CDN server
     */
    async uploadFile(file: MulterFile | undefined, data?: UploadFileDto): Promise<File> {
        if (!file) {
            throw new BadRequestException("File không được để trống");
        }

        validateImageFile(file.mimetype);
        
        const cdnPaths = await this.uploadToCDN([file], data || { object: "", object_id: "" });
        
        if (!cdnPaths || cdnPaths.length === 0) {
            throw new HttpException("Upload không thành công, CDN không phản hồi", 500);
        }
        
        const fileEntity = this.createFileEntity(file, cdnPaths[0]);
        return await this.fileRepo.save(fileEntity);
    }

    /**
     * @description: Upload multiple files lên CDN server
     */
    async uploadFiles(files: MulterFile[], data?: UploadFileDto): Promise<File[]> {
        if (!files || files.length === 0) {
            throw new BadRequestException("Files không được để trống");
        }

        for (const file of files) {
            validateImageFile(file.mimetype);
        }

        const cdnPaths = await this.uploadToCDN(files, data || { object: "", object_id: "" });

        if (!cdnPaths || cdnPaths.length === 0) {
            throw new HttpException("Upload không thành công, CDN không phản hồi", 500);
        }

        const uploadedFiles = files.map((file, index) =>
            this.createFileEntity(file, cdnPaths[index] || "")
        );

        return await this.fileRepo.save(uploadedFiles);
    }

    /**
     * @description: Tạo file entity từ file và CDN path
     */
    private createFileEntity(file: MulterFile, cdnPath: string): File {
        const fileName = path.basename(cdnPath);

        return this.fileRepo.create({
            originalName: file.originalname,
            fileName,
            path: cdnPath,
            mimeType: file.mimetype,
            size: file.size,
            fileType: getFileType(file.mimetype),
            isUsed: false,
        });
        /**
         * Set isUsed = false nếu hình được lưu thì sẽ update isUsed thành true
         * Các dữ liệu isUsed = false sẽ được cron job chạy tự động để xoá
         */
    }

    /**
     * @description: Upload files lên CDN server
     */
    private async uploadToCDN(
        files: MulterFile[],
        data: UploadFileDto
    ): Promise<string[]> {
        if (!files.length) {
            return [];
        }

        const formData = new FormDataLib();

        for (const file of files) {
            formData.append("files", file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }

        formData.append("object", data.object);
        formData.append("object_id", data.object_id);

        if (data.object_type) {
            formData.append("object_type", data.object_type);
        }

        const { uploadUrl: uploadImageApi, authUuid: cdnAuthUuid } = CDNConfig.getUploadConfig();

        const config = {
            method: "post" as const,
            url: uploadImageApi,
            headers: {
                // Chỉ dùng getHeaders() — không set Content-Type thuần: sẽ mất boundary và hỏng multipart
                ...formData.getHeaders(),
                "auth-uuid": cdnAuthUuid,
            },
            data: formData,
        };

        try {
            const response = await axios(config);
            
            if (!response?.data) {
                throw new HttpException("Upload không thành công, CDN không phản hồi", 500);
            }

            const result = (response.data.data as string[]) || [];
            return Array.isArray(result) ? result : [];
        } catch (error: unknown) {
            this.handleAxiosError(error, "Có lỗi xảy ra");
        }
    }

    /**
     * @description: Đánh dấu các file đã được sử dụng theo danh sách ID
     * @returns Số bản ghi được cập nhật
     */
    async markFilesAsUsedByIds(fileIds: number[]): Promise<number> {
        if (!fileIds || fileIds.length === 0) return 0;
        const result = await this.fileRepo.update(
            { id: In(fileIds) },
            { isUsed: true }
        );
        return result.affected || 0;
    }

    /**
     * @description: Đánh dấu các file đã được sử dụng theo danh sách CDN path
     * Hữu ích khi phía client chỉ trả về path sau khi upload
     * @returns Số bản ghi được cập nhật
     */
    async markFilesAsUsedByPaths(paths: string[]): Promise<number> {
        if (!paths || paths.length === 0) return 0;
        const result = await this.fileRepo.update(
            { path: In(paths) },
            { isUsed: true }
        );
        return result.affected || 0;
    }

    /**
     * @description: Lấy thông tin file theo ID
     */
    async findOne(id: number): Promise<File> {
        const file = await this.fileRepo.findOne({ where: { id } });

        if (!file) {
            throw new BadRequestException("File không tồn tại");
        }

        return file;
    }

    /**
     * @description: Tạo axios config cho remove operations
     */
    private createRemoveConfig(
        url: string,
        data: { url?: string; urls?: string[] }
    ): {
        method: "put";
        url: string;
        headers: { "Content-Type": string; "auth-uuid": string };
        data: { url?: string; urls?: string[] };
    } {
        const authUuid = CDNConfig.getAuthUuid();

        return {
            method: "put",
            url,
            headers: {
                "Content-Type": "application/json",
                "auth-uuid": authUuid,
            },
            data,
        };
    }

    /**
     * @description: Xóa file từ CDN server
     */
    async removeFile(url: string): Promise<void> {
        if (!url) {
            throw new BadRequestException("URL không được để trống");
        }

        const removeFileUrl = CDNConfig.getRemoveFileUrl();
        const config = this.createRemoveConfig(removeFileUrl, { url });

        try {
            await axios(config);
        } catch (error: unknown) {
            this.handleAxiosError(error, "Có lỗi xảy ra khi xóa file");
        }
    }

    /**
     * @description: Xóa nhiều file từ CDN server
     */

    async removeFiles(urls: string[]): Promise<void> {
        if (!urls || urls.length === 0) {
            throw new BadRequestException("URLs không được để trống");
        }

        const removeFilesUrl = CDNConfig.getRemoveFilesUrl();
        const config = this.createRemoveConfig(removeFilesUrl, { urls });

        try {
            await axios(config);
        } catch (error: unknown) {
            this.handleAxiosError(error, "Có lỗi xảy ra khi xóa files");
        }
    }

    /**
     * @description: Xử lý lỗi từ axios request
     */
    private handleAxiosError(error: unknown, defaultMessage: string): never {
        console.log(error);
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string; data?: unknown }>;

            if (axiosError.response?.status === 413) {
                throw new HttpException("Upload không thành công, kích thước file quá lớn.", 413);
            }

            let responseMessageString: string | null = null;

            const responseData = axiosError.response?.data;
            if (responseData) {
                if (
                    typeof responseData === "object" &&
                    responseData !== null &&
                    "message" in responseData
                ) {
                    responseMessageString = safeStringify(responseData.message);
                } else {
                    responseMessageString = safeStringify(responseData);
                }
            }

            if (!responseMessageString && axiosError.message) {
                responseMessageString = safeStringify(axiosError.message);
            }

            const errorMessage = responseMessageString
                ? `${defaultMessage}: ${responseMessageString}`
                : defaultMessage;
            const statusCode = axiosError.response?.status || 500;

            throw new HttpException(errorMessage, statusCode);
        }

        // Handle non-axios errors
        const errorMessage =
            error instanceof Error ? `${defaultMessage}: ${error.message}` : defaultMessage;
        throw new HttpException(errorMessage, 500);
    }

    async findOneByPath(path: string): Promise<File> {
        const file = await this.fileRepo.findOne({ where: { path } });

        if (!file) {
            throw new BadRequestException("File không tồn tại");
        }
        return file;
    }

    async findOneById(id: number): Promise<File> {
        const file = await this.fileRepo.findOne({ where: { id } });

        if (!file) {
            throw new BadRequestException("File không tồn tại");
        }
        return file;
    }

    /**
     * @description: Xử lý cập nhật URLs ảnh - tự động xóa file cũ và đánh dấu file mới
     * @param entity Entity hiện tại chứa các URL cũ
     * @param updateData Data cập nhật chứa các URL mới
     * @param urlFields Danh sách các field names chứa URL cần xử lý (ví dụ: ['iconUrl', 'thumbnailUrl'])
     * @returns Promise<void>
     */
    async handleUrlUpdates<T extends Record<string, any>>(
        entity: T,
        updateData: Partial<T>,
        urlFields: (keyof T)[]
    ): Promise<void> {
        const pathsToDelete: string[] = [];
        const pathsToMark: string[] = [];

        // Xử lý từng field
        for (const field of urlFields) {
            const oldUrl = (entity[field] as string | null | undefined) ?? null;
            const newUrl = (updateData[field] as string | null | undefined) ?? null;

            // Xóa file cũ nếu URL thay đổi hoặc bị xóa
            if (oldUrl && oldUrl !== newUrl) {
                pathsToDelete.push(oldUrl);
            }

            // Đánh dấu file mới nếu có URL mới và khác URL cũ
            if (newUrl && newUrl !== oldUrl) {
                pathsToMark.push(newUrl);
            }
        }

        // Xóa các file cũ đã bị thay thế hoặc xóa
        if (pathsToDelete.length > 0) {
            await this.removeFiles(pathsToDelete);
        }

        // Đánh dấu các file mới đang được sử dụng
        if (pathsToMark.length > 0) {
            await this.markFilesAsUsedByPaths(pathsToMark);
        }
    }
}
