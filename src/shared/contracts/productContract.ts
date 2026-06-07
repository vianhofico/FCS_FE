/**
 * Product, Brand, Category contract types
 */

import type { ProductStatus, MediaType, MediaOwnerType } from "@/shared/contracts/commonContract";

/**
 * Brand entity
 */
export type ProductBrand = {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
};

/**
 * Brand request
 */
export type ProductBrandRequest = {
  name: string;
  description?: string;
  logoUrl?: string;
};

/**
 * Category entity
 */
export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level?: number;
  createdAt?: string;
};

/**
 * Category request
 */
export type ProductCategoryRequest = {
  name: string;
  description?: string;
  parentId?: string;
};

/**
 * Product summary (for lists)
 */
export type ProductSummary = {
  id: string;
  sku: string;
  name: string;
  brandId?: string;
  brandName?: string;
  originalPrice?: number;
  salePrice: number;
  status: ProductStatus;
  condition?: number; // 0-100
  conditionPercent?: number; // 0-100
  imageUrl?: string;
  createdAt?: string;
};

/**
 * Product detail
 */
export type ProductDetail = ProductSummary & {
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  stock?: number;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  size?: string;
  conditionNote?: string;
  updatedAt?: string;
};

/**
 * Product create/update request
 */
export type ProductRequest = {
  sku?: string;
  name: string;
  description?: string;
  brandId?: string;
  originalPrice?: number;
  salePrice: number;
  status?: ProductStatus;
  condition?: number;
  stock?: number;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  size?: string;
  conditionNote?: string;
};

/**
 * Product status update request
 */
export type ProductStatusRequest = {
  status: ProductStatus;
};

/**
 * Product query filters
 */
export type ProductQuery = {
  keyword?: string;
  brandId?: string;
  categoryId?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minCondition?: number;
  maxCondition?: number;
  status?: ProductStatus;
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * Category assignment request
 */
export type ProductCategoryAssignRequest = {
  categoryIds: string[];
  primaryCategoryId?: string;
};

/**
 * Media entity
 */
export type ProductMedia = {
  id: string;
  ownerType: MediaOwnerType;
  ownerId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  displayOrder: number;
  isPrimary?: boolean;
  createdAt?: string;
};

/**
 * Media create/update request
 */
export type ProductMediaRequest = {
  ownerType: MediaOwnerType;
  ownerId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  displayOrder?: number;
  isPrimary?: boolean;
};

/**
 * Warehouse log entity
 */
export type ProductWarehouseLog = {
  id: string;
  productId: string;
  location?: string;
  actionType: "IN" | "OUT" | "ADJUSTMENT" | "STOCK_TAKE";
  quantity?: number;
  note?: string;
  createdAt?: string;
};

/**
 * Warehouse log create request
 */
export type ProductWarehouseLogRequest = {
  productId: string;
  location?: string;
  actionType: "IN" | "OUT" | "ADJUSTMENT" | "STOCK_TAKE";
  quantity?: number;
  note?: string;
};

/**
 * System settings entity
 */
export type CatalogSetting = {
  id: string;
  key: string;
  value: string;
  description?: string;
  type?: "STRING" | "NUMBER" | "BOOLEAN" | "JSON";
  updatedAt?: string;
};

/**
 * System settings update request
 */
export type CatalogSettingRequest = {
  value: string;
  description?: string;
};
