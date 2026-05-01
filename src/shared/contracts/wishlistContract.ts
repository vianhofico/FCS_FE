/**
 * Wishlist contract types
 */

/**
 * Wishlist item
 */
export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  sku: string;
  salePrice: number;
  productStatus: string;
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
