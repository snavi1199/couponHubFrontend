// Mirrors the backend enums/DTOs 1:1. Keep in sync with couponhub-backend's
// com.couponhub.entity.enums and com.couponhub.dto.response packages.

export type Role =
  | 'ROLE_GUEST'
  | 'ROLE_USER'
  | 'ROLE_VERIFIED_USER'
  | 'ROLE_SELLER'
  | 'ROLE_PREMIUM_SELLER'
  | 'ROLE_MODERATOR'
  | 'ROLE_ADMIN'
  | 'ROLE_SUPER_ADMIN';

export type CouponType =
  | 'FREE'
  | 'PAID'
  | 'HALF_PAID'
  | 'NEGOTIABLE'
  | 'AUCTION'
  | 'LIMITED_TIME'
  | 'REFERRAL'
  | 'CASHBACK'
  | 'GIFT_CARD'
  | 'VOUCHER'
  | 'PROMO_CODE'
  | 'MEMBERSHIP'
  | 'PREMIUM_DEAL'
  | 'EVENT_TICKET';

export type TicketCategory =
  | 'MOVIE'
  | 'CRICKET'
  | 'FOOTBALL'
  | 'CONCERT'
  | 'THEATRE'
  | 'COMEDY_SHOW'
  | 'OTHER_SPORTS'
  | 'OTHER_EVENT';

export type CouponStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'SOLD_OUT'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REJECTED'
  | 'DELETED';

export type CouponVoteType = 'WORKING' | 'EXPIRED';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiErrorShape {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; message: string }[];
}

export interface UserResponse {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  location?: string | null;
  bio?: string | null;
  roles: Role[];
  emailVerified: boolean;
  phoneVerified: boolean;
  premium: boolean;
  averageRating?: number | null;
  reviewCount?: number | null;
  followersCount?: number | null;
  followingCount?: number | null;
  couponsUploadedCount?: number | null;
  couponsSoldCount?: number | null;
  couponsPurchasedCount?: number | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  user: UserResponse;
}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  featured: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder: number;
}

export interface CouponResponse {
  id: string;
  title: string;
  brand: BrandResponse;
  category: CategoryResponse;
  seller: UserResponse;
  description?: string;
  couponCode: string;
  type: CouponType;
  status: CouponStatus;
  expiryDate?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  discountPercentage?: number;
  flatDiscount?: number;
  cashbackAmount?: number;
  termsConditions?: string;
  originalValue?: number;
  sellingPrice: number;
  negotiableMinPrice?: number;
  availableQuantity: number;
  soldQuantity: number;
  viewCount: number;
  workingVotes: number;
  expiredVotes: number;
  verifiedWorking: boolean;
  featured: boolean;
  flashDeal: boolean;
  imageUrls: string[] | null;
  publishedAt?: string | null;
  createdAt: string;
  ticketCategory?: TicketCategory;
  venueName?: string;
  venueCity?: string;
  eventDateTime?: string;
  seatDetails?: string;
  platformFeePercentage: number;
  platformFeeAmount: number;
  sellerReceivableAmount: number;
}

export interface CouponCreatePayload {
  title: string;
  brandId: string;
  categoryId: string;
  description?: string;
  couponCode: string;
  type: CouponType;
  expiryDate?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  discountPercentage?: number;
  flatDiscount?: number;
  cashbackAmount?: number;
  termsConditions?: string;
  originalValue?: number;
  sellingPrice: number;
  negotiableMinPrice?: number;
  availableQuantity: number;
  imageUrls?: string[];
  ticketCategory?: TicketCategory;
  venueName?: string;
  venueCity?: string;
  eventDateTime?: string;
  seatDetails?: string;
}

export interface CouponUpdatePayload {
  title?: string;
  description?: string;
  expiryDate?: string;
  sellingPrice?: number;
  negotiableMinPrice?: number;
  availableQuantity?: number;
  termsConditions?: string;
}

export interface CouponSearchParams {
  keyword?: string;
  brandId?: string;
  categoryId?: string;
  type?: CouponType;
  status?: CouponStatus;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  onlyFree?: boolean;
  onlyFeatured?: boolean;
  excludeExpired?: boolean;
  ticketCategory?: TicketCategory;
  page?: number;
  size?: number;
  sort?: string;
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';

export interface CouponRequestResponse {
  id: string;
  couponId: string;
  couponTitle: string;
  buyer: UserResponse;
  seller: UserResponse;
  status: RequestStatus;
  offeredPrice?: number;
  message?: string;
  createdAt: string;
  upiPaymentLink?: string;
  upiQrCodeDataUri?: string;
}

export interface CouponRequestCreatePayload {
  offeredPrice?: number;
  message?: string;
}

export type NotificationType =
  | 'COUPON_PURCHASED' | 'COUPON_SOLD' | 'COUPON_REQUESTED' | 'COUPON_ACCEPTED' | 'COUPON_REJECTED'
  | 'COUNTER_OFFER' | 'PAYMENT_SUCCESS' | 'COUPON_EXPIRING' | 'WITHDRAWAL_COMPLETED'
  | 'REVIEW_RECEIVED' | 'CHAT_MESSAGE' | 'SYSTEM';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  channel: string;
  title: string;
  message?: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface BulkCouponCreateResponse {
  totalRequested: number;
  succeededCount: number;
  failedCount: number;
  created: CouponResponse[];
  failures: { index: number; title: string; reason: string }[];
}
