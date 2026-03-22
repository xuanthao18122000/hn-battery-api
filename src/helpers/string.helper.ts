/**
 * @description: Chuyển đổi giá trị thành string an toàn
 * Xử lý các trường hợp: string, object, null, undefined, number, etc.
 */
export function safeStringify(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return `[${typeof value}]`;
        }
    }
    // Xử lý các primitive types: number, boolean, bigint, symbol
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (typeof value === "symbol") {
        return value.toString();
    }
    // Fallback cho các type khác
    return `[${typeof value}]`;
}

/**
 * @description: Parse JSON string thành object an toàn
 * Xử lý các trường hợp: string (JSON), object, null, undefined, empty string
 * @returns Parsed object hoặc null nếu không thể parse
 * @throws Error nếu JSON string không hợp lệ
 */
export function safeParseJSON(value: unknown): Record<string, unknown> | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    // Nếu đã là object, giữ nguyên
    if (typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    // Nếu là string, parse JSON
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            // Đảm bảo kết quả là object, không phải array hoặc primitive
            if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
                return parsed as Record<string, unknown>;
            }
            throw new Error("JSON phải là object hợp lệ, không phải array hoặc primitive value");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`seoBaseSchema phải là JSON hợp lệ: ${errorMessage}`);
        }
    }
    throw new Error("seoBaseSchema phải là string JSON hoặc object");
}
