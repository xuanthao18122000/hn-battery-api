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

  return {
    data,
    total,
    page: Number(query?.page),
    limit: Number(query?.limit),
  };
};

export const getFullResponse = <T>(data: Array<T>, total: number) => {
  return { data, total };
};
