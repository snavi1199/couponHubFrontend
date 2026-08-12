import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name').max(150),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string({ required_error: 'UPI-linked phone number is required' })
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number (e.g. +919876543210)'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(100)
    .regex(/[a-z]/, 'Add a lowercase letter')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[0-9]/, 'Add a number'),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const couponCreateSchema = z.object({
  title: z.string().min(3, 'Give your coupon a clear title').max(200),
  brandId: z.string().uuid('Choose a brand'),
  categoryId: z.string().uuid('Choose a category'),
  description: z.string().max(5000).optional().or(z.literal('')),
  couponCode: z.string().min(2, 'Enter the coupon code').max(100),
  type: z.enum([
    'FREE', 'PAID', 'HALF_PAID', 'NEGOTIABLE', 'AUCTION', 'LIMITED_TIME',
    'REFERRAL', 'CASHBACK', 'GIFT_CARD', 'VOUCHER', 'PROMO_CODE', 'MEMBERSHIP', 'PREMIUM_DEAL',
    'EVENT_TICKET',
  ]),
  expiryDate: z.string().optional().or(z.literal('')),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  originalValue: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
  negotiableMinPrice: z.coerce.number().min(0).optional(),
  availableQuantity: z.coerce.number().int().min(1, 'At least 1'),
  termsConditions: z.string().max(3000).optional().or(z.literal('')),
  ticketCategory: z.enum([
    'MOVIE', 'CRICKET', 'FOOTBALL', 'CONCERT', 'THEATRE', 'COMEDY_SHOW', 'OTHER_SPORTS', 'OTHER_EVENT',
  ]).optional(),
  venueName: z.string().max(255).optional().or(z.literal('')),
  venueCity: z.string().max(120).optional().or(z.literal('')),
  eventDateTime: z.string().optional().or(z.literal('')),
  seatDetails: z.string().max(255).optional().or(z.literal('')),
}).refine(
  (data) => !(data.type === 'FREE' && data.sellingPrice > 0),
  { message: 'FREE coupons must have a selling price of 0', path: ['sellingPrice'] }
).refine(
  (data) => data.type !== 'EVENT_TICKET' || !!data.ticketCategory,
  { message: 'Choose what kind of event this is', path: ['ticketCategory'] }
).refine(
  (data) => data.type !== 'EVENT_TICKET' || !!(data.venueName && data.venueName.trim()),
  { message: 'Venue name is required for event tickets', path: ['venueName'] }
).refine(
  (data) => data.type !== 'EVENT_TICKET' || !!data.eventDateTime,
  { message: 'Event date & time is required for event tickets', path: ['eventDateTime'] }
);
export type CouponCreateFormValues = z.infer<typeof couponCreateSchema>;
