/**
 * Product review contract types
 */

/**
 * Product review
 */
export type ProductReview = {
  id: string;
  productId: string;
  reviewedBy: string;
  rating: number; // 1-5
  comment?: string;
  helpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Create product review request
 */
export type ProductReviewCreateRequest = {
  productId: string;
  rating: number; // 1-5
  comment?: string;
};

/**
 * Review summary (aggregate)
 */
export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

/**
 * Review query filters
 */
export type ReviewQuery = {
  productId: string;
  page?: number;
  size?: number;
  sort?: string;
};
