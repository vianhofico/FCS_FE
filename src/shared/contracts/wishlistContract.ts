/**
 * Wishlist contract types
 */

/**
 * Wishlist item
 */
export type WishlistItem = {
  id: string;
  userId?: string;
  productId: string;
  productSku?: string;
  productName: string;
  productSalePrice?: number;
  productStatus: string;
  sku?: string;
  salePrice?: number;
  imageUrl?: string;
  addedAt?: string;
};

/**
 * Wishlist query filters
 */
export type WishlistQuery = {
  page?: number;
  size?: number;
  sort?: string;
};
