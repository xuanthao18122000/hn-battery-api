import { PaginationOptionsDto } from '../dto/pagination-query';

/**
 * Tạo đối tượng phản hồi chuẩn cho các API danh sách
 * @param data Mảng dữ liệu cần trả về
 * @param total Tổng số bản ghi
 * @param query Tham số phân trang
 * @returns Đối tượng phản hồi đã chuẩn hóa
 */
export const paginatedResponse = <T>(
  data: Array<T>,
  total: number,
  query?: PaginationOptionsDto,
) => {
  if (query?.getFull === true) {
    return { data, total };
  }

  const limit = Number(query?.limit);
  return {
    data,
    total,
    page: Number(query?.page),
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
  };
};

export const getFullResponse = <T>(data: Array<T>, total: number) => {
  return { data, total };
};
