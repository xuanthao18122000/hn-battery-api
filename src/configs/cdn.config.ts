import { getEnv } from "./env.config";
import { BadRequestException } from "@nestjs/common";

/**
 * @description: Cấu hình CDN server
 */
export class CDNConfig {
    /**
     * @description: API paths của CDN server
     */
    private static readonly API_PATHS = {
        // Trailing slash: một số origin/nginx chỉ khớp đúng /uploads/
        UPLOAD: "/uploads/",
        REMOVE_FILE: "/remove-file",
        REMOVE_FILES: "/remove-files",
    } as const;

    /**
     * @description: Lấy base URL của CDN server
     */
    private static getBaseUrl(): string {
        const url = getEnv<string>("CDN_UPLOAD_URL");
        if (!url) {
            throw new BadRequestException("CDN_UPLOAD_URL chưa được cấu hình!");
        }
        // Đảm bảo base URL không có trailing slash
        return url.endsWith("/") ? url.slice(0, -1) : url;
    }

    /**
     * @description: Build full URL từ base URL và path
     */
    private static buildUrl(path: string): string {
        const baseUrl = this.getBaseUrl();

        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        return `${baseUrl}${normalizedPath}`;
    }

    /**
     * @description: Lấy URL API upload file
     */
    static getUploadUrl(): string {
        return this.buildUrl(this.API_PATHS.UPLOAD);
    }

    /**
     * @description: Lấy Auth UUID cho CDN (bắt buộc)
     */
    static getAuthUuid(): string {
        const authUuid = getEnv<string>("CDN_UPLOAD_AUTH_UUID");
        if (!authUuid) {
            throw new BadRequestException("CDN_UPLOAD_AUTH_UUID chưa được cấu hình!");
        }
        return authUuid;
    }

    /**
     * @description: Lấy URL API remove file
     */
    static getRemoveFileUrl(): string {
        return this.buildUrl(this.API_PATHS.REMOVE_FILE);
    }

    /**
     * @description: Lấy URL API remove files
     */
    static getRemoveFilesUrl(): string {
        return this.buildUrl(this.API_PATHS.REMOVE_FILES);
    }

    /**
     * @description: Lấy cấu hình đầy đủ cho upload
     */
    static getUploadConfig(): { uploadUrl: string; authUuid: string } {
        return {
            uploadUrl: this.getUploadUrl(),
            authUuid: this.getAuthUuid(),
        };
    }

    /**
     * URL public (pull zone) để ghép vào path file — khác CDN_UPLOAD_URL (origin upload).
     */
    static getPublicCdnBaseUrl(): string | null {
        const url = getEnv<string>("CDN_URL");
        if (!url?.trim()) return null;
        return url.trim().replace(/\/+$/, "");
    }

    /**
     * Path từ API upload (vd: files/products/...) → full URL CDN.
     * Đã là http(s) hoặc // thì giữ nguyên.
     */
    static toPublicAssetUrl(pathOrUrl: string): string {
        const s = pathOrUrl.trim();
        if (!s || /^https?:\/\//i.test(s) || s.startsWith("//")) {
            return s;
        }
        const base = this.getPublicCdnBaseUrl();
        if (!base) return s;
        const rel = s.replace(/^\/+/, "");
        return `${base}/${rel}`;
    }
}
