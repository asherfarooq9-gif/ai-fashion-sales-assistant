import { z } from 'zod';
import {
  PRODUCT_CATEGORIES,
  GENDERS,
  CHANNELS,
  INTENTS,
  SENTIMENTS,
  LANGUAGES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from '../enums/index.js';

export const productSchema = z.object({
  name: z.string().min(2),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().int().nonnegative(),
  currency: z.string().default('PKR'),
  description: z.string().default(''),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string().url()).default([]),
  discount: z.number().min(0).max(70).default(0),
  rating: z.number().min(0).max(5).default(4.2),
  gender: z.enum(GENDERS).default('women'),
  tags: z.array(z.string()).default([]),
  salesCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();

export const productQuerySchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  gender: z.enum(GENDERS).optional(),
  color: z.string().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  q: z.string().optional(),
  trending: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  page: z.coerce.number().int().positive().default(1),
});

export const addressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Pakistan'),
  postalCode: z.string().optional(),
  raw: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  instagramId: z.string().optional(),
  whatsappId: z.string().optional(),
  address: addressSchema.optional(),
  preferences: z
    .object({
      gender: z.enum(GENDERS).optional(),
      favoriteColor: z.string().optional(),
      budget: z.number().int().positive().optional(),
      categories: z.array(z.enum(PRODUCT_CATEGORIES)).default([]),
    })
    .optional(),
  language: z.enum(LANGUAGES).default('en'),
  tags: z.array(z.string()).default([]),
});

export const customerUpdateSchema = customerSchema.partial();

export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string().optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().positive().default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const orderCreateSchema = z.object({
  customerId: z.string(),
  items: z.array(orderItemSchema).min(1),
  channel: z.enum(CHANNELS).default('simulator'),
  shippingAddress: addressSchema.optional(),
  notes: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  trackingNumber: z.string().optional(),
});

export const chatMessageSchema = z.object({
  channel: z.enum(CHANNELS).default('simulator'),
  senderId: z.string().min(1),
  senderName: z.string().optional(),
  text: z.string().default(''),
  attachments: z
    .array(z.object({ type: z.string(), url: z.string() }))
    .default([]),
  send: z.boolean().default(false),
});

export const cannedResponseSchema = z.object({
  key: z.string().min(2),
  intent: z.enum(INTENTS),
  language: z.enum(LANGUAGES).default('en'),
  triggerExamples: z.array(z.string()).default([]),
  responseTemplate: z.string().min(1),
  isFewShot: z.boolean().default(false),
  enabled: z.boolean().default(true),
  priority: z.number().int().default(0),
});

export const cannedResponseUpdateSchema = cannedResponseSchema.partial();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// LLM structured-output schemas (used by provider.json + chains)
export const intentResultSchema = z.object({
  intent: z.enum(INTENTS),
  confidence: z.number().min(0).max(1).default(0.5),
  entities: z
    .object({
      category: z.string().optional(),
      gender: z.string().optional(),
      color: z.string().optional(),
      size: z.string().optional(),
      budget: z.number().optional(),
      productName: z.string().optional(),
      orderId: z.string().optional(),
      quantity: z.number().optional(),
      action: z.string().optional(),
    })
    .default({}),
});

export const sentimentResultSchema = z.object({
  sentiment: z.enum(SENTIMENTS),
  score: z.number().min(-1).max(1).default(0),
});

export const orderExtractResultSchema = z.object({
  items: z
    .array(
      z.object({
        productName: z.string().optional(),
        productId: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .default([]),
  addressText: z.string().optional(),
  confirm: z.boolean().default(false),
});
