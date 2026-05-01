/**
 * Product API service
 * Handles product CRUD, categories, media, warehouse logs
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  ProductSummary,
  ProductDetail,
  ProductRequest,
  ProductStatusRequest,
  ProductQuery,
  ProductCategoryAssignRequest,
  ProductMedia,
  ProductMediaRequest,
  ProductWarehouseLog,
  ProductWarehouseLogRequest,
  ProductBrand,
  ProductBrandRequest,
  ProductCategory,
  ProductCategoryRequest,
} from "@/shared/contracts/productContract";

export const productApi = {
  // ==================== PRODUCTS ====================

  /**
   * Get paginated list of products with filters
   */
  getProducts: async (query: ProductQuery = {}): Promise<ApiResponse<PageResponse<ProductSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<ProductSummary>>>(endpoints.products, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get single product detail
   */
  getProductDetail: async (productId: string): Promise<ApiResponse<ProductDetail>> => {
    const response = await http.get<ApiResponse<ProductDetail>>(`${endpoints.products}/${productId}`);
    return response.data;
  },

  /**
   * Create new product
   */
  createProduct: async (payload: ProductRequest): Promise<ApiResponse<ProductSummary>> => {
    const response = await http.post<ApiResponse<ProductSummary>>(endpoints.products, payload);
    return response.data;
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, payload: ProductRequest): Promise<ApiResponse<ProductDetail>> => {
    const response = await http.put<ApiResponse<ProductDetail>>(
      `${endpoints.products}/${productId}`,
      payload
    );
    return response.data;
  },

  /**
   * Update product status
   */
  updateProductStatus: async (
    productId: string,
    payload: ProductStatusRequest
  ): Promise<ApiResponse<ProductDetail>> => {
    const response = await http.patch<ApiResponse<ProductDetail>>(
      `${endpoints.products}/${productId}/status`,
      payload
    );
    return response.data;
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.products}/${productId}`
    );
    return response.data;
  },

  // ==================== PRODUCT CATEGORIES ====================

  /**
   * Get product categories for a product
   */
  getProductCategories: async (productId: string): Promise<ApiResponse<ProductCategory[]>> => {
    const response = await http.get<ApiResponse<ProductCategory[]>>(
      `${endpoints.products}/${productId}/categories`
    );
    return response.data;
  },

  /**
   * Assign categories to product
   */
  assignProductCategories: async (
    productId: string,
    payload: ProductCategoryAssignRequest
  ): Promise<ApiResponse<ProductCategory[]>> => {
    const response = await http.put<ApiResponse<ProductCategory[]>>(
      `${endpoints.products}/${productId}/categories`,
      payload
    );
    return response.data;
  },

  // ==================== MEDIA ====================

  /**
   * Upload media
   */
  uploadMedia: async (payload: ProductMediaRequest): Promise<ApiResponse<ProductMedia>> => {
    const response = await http.post<ApiResponse<ProductMedia>>(endpoints.media, payload);
    return response.data;
  },

  /**
   * Get media for entity
   */
  getMedia: async (ownerType: string, ownerId: string): Promise<ApiResponse<ProductMedia[]>> => {
    const response = await http.get<ApiResponse<ProductMedia[]>>(endpoints.media, {
      params: { ownerType, ownerId },
    });
    return response.data;
  },

  /**
   * Delete media
   */
  deleteMedia: async (mediaId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(`${endpoints.media}/${mediaId}`);
    return response.data;
  },

  // ==================== WAREHOUSE LOGS ====================

  /**
   * Create warehouse log
   */
  createWarehouseLog: async (payload: ProductWarehouseLogRequest): Promise<ApiResponse<ProductWarehouseLog>> => {
    const response = await http.post<ApiResponse<ProductWarehouseLog>>(
      `${endpoints.products}/warehouse-logs`,
      payload
    );
    return response.data;
  },

  /**
   * Get warehouse logs for product
   */
  getWarehouseLogs: async (productId: string): Promise<ApiResponse<PageResponse<ProductWarehouseLog>>> => {
    const response = await http.get<ApiResponse<PageResponse<ProductWarehouseLog>>>(
      `${endpoints.products}/${productId}/warehouse-logs`
    );
    return response.data;
  },

  // ==================== BRANDS ====================

  /**
   * Get all brands
   */
  getBrands: async (): Promise<ApiResponse<PageResponse<ProductBrand>>> => {
    const response = await http.get<ApiResponse<PageResponse<ProductBrand>>>(endpoints.catalogBrands);
    return response.data;
  },

  /**
   * Get single brand
   */
  getBrandDetail: async (brandId: string): Promise<ApiResponse<ProductBrand>> => {
    const response = await http.get<ApiResponse<ProductBrand>>(`${endpoints.catalogBrands}/${brandId}`);
    return response.data;
  },

  /**
   * Create brand
   */
  createBrand: async (payload: ProductBrandRequest): Promise<ApiResponse<ProductBrand>> => {
    const response = await http.post<ApiResponse<ProductBrand>>(endpoints.catalogBrands, payload);
    return response.data;
  },

  /**
   * Update brand
   */
  updateBrand: async (brandId: string, payload: ProductBrandRequest): Promise<ApiResponse<ProductBrand>> => {
    const response = await http.put<ApiResponse<ProductBrand>>(
      `${endpoints.catalogBrands}/${brandId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete brand
   */
  deleteBrand: async (brandId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.catalogBrands}/${brandId}`
    );
    return response.data;
  },

  // ==================== CATEGORIES ====================

  /**
   * Get all categories
   */
  getCategories: async (): Promise<ApiResponse<PageResponse<ProductCategory>>> => {
    const response = await http.get<ApiResponse<PageResponse<ProductCategory>>>(endpoints.catalogCategories);
    return response.data;
  },

  /**
   * Get single category
   */
  getCategoryDetail: async (categoryId: string): Promise<ApiResponse<ProductCategory>> => {
    const response = await http.get<ApiResponse<ProductCategory>>(
      `${endpoints.catalogCategories}/${categoryId}`
    );
    return response.data;
  },

  /**
   * Create category
   */
  createCategory: async (payload: ProductCategoryRequest): Promise<ApiResponse<ProductCategory>> => {
    const response = await http.post<ApiResponse<ProductCategory>>(
      endpoints.catalogCategories,
      payload
    );
    return response.data;
  },

  /**
   * Update category
   */
  updateCategory: async (
    categoryId: string,
    payload: ProductCategoryRequest
  ): Promise<ApiResponse<ProductCategory>> => {
    const response = await http.put<ApiResponse<ProductCategory>>(
      `${endpoints.catalogCategories}/${categoryId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete category
   */
  deleteCategory: async (categoryId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.catalogCategories}/${categoryId}`
    );
    return response.data;
  },
};
