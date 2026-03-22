import { BadRequestException } from "@nestjs/common";

/**
 * @description: Lấy loại file từ MIME type
 */
export function getFileType(mimeType: string): string {
    if (mimeType.startsWith("image/")) {
        return "image";
    }
    if (mimeType.startsWith("video/")) {
        return "video";
    }
    if (mimeType.startsWith("audio/")) {
        return "audio";
    }
    if (
        mimeType.includes("pdf") ||
        mimeType.includes("word") ||
        mimeType.includes("excel") ||
        mimeType.includes("powerpoint")
    ) {
        return "document";
    }
    return "other";
}

/**
 * @description: Validate file là hình ảnh
 */
export function validateImageFile(mimeType: string): void {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
        throw new BadRequestException("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP, SVG)");
    }
}
