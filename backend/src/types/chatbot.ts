import { z } from "zod";

export const chatIntentSchema = z.enum([
  "sales_summary",
  "top_products",
  "payment_methods",
  "sales_channels",
  "locations",
  "customers",
  "pending_sales",
  "comparison",
  "unsupported",
]);

export type ChatIntent = z.infer<typeof chatIntentSchema>;

export const intentClassificationSchema = z.object({
  intent: chatIntentSchema,
  dateRange: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  limit: z.number().int().min(1).max(10).optional(),
  groupBy: z.string().optional(),
  unsupportedReason: z.string().optional(),
});

export type IntentClassification = z.infer<typeof intentClassificationSchema>;

export const assistantAnswerSchema = z.object({
  answer: z.string().min(1),
  suggestions: z.array(z.string()).max(4).default([]),
});

export type AssistantAnswer = z.infer<typeof assistantAnswerSchema>;

export type ChatbotFacts = Record<string, unknown>;
