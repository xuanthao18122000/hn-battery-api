import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductBreadcrumbItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'Slug danh mục (URL path)' })
  slug: string;
}

export class ProductBreadcrumbDto {
  @ApiProperty({ type: [ProductBreadcrumbItemDto] })
  items: ProductBreadcrumbItemDto[];

  @ApiProperty({ enum: ['from_category', 'default'] })
  source: 'from_category' | 'default';

  @ApiPropertyOptional({
    description:
      'Slug danh mục đã dùng để resolve (khi source=from_category), hoặc null',
    nullable: true,
  })
  resolvedFromCategorySlug: string | null;
}
