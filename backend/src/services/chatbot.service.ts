import AppError from "../errors/appError.js";
import {
  assertBusinessAccess,
  getChannelBreakdown,
  getCustomerRanking,
  getLocationBreakdown,
  getPaymentBreakdown,
  getPendingSales,
  getSalesSummary,
  getTopProducts,
  type AnalyticsDateRange,
} from "../repositories/chatbot.repository.js";
import {
  classifyChatIntent,
  generateAssistantAnswer,
} from "./ai.service.js";
import type {
  ChatbotFacts,
  ChatbotMessageRequest,
  IntentClassification,
} from "../types/chatbot.js";

const DEFAULT_LIMIT = 5;
const MAX_RANGE_MONTHS = 12;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDateRange(intent: IntentClassification): AnalyticsDateRange {
  const now = new Date();
  const from = parseDate(intent.dateRange?.from) ?? startOfMonth(now);
  const to = parseDate(intent.dateRange?.to) ?? endOfDay(now);

  if (from > to) {
    throw new AppError("Rango de fechas inválido", 400);
  }

  const maxTo = new Date(from);
  maxTo.setMonth(maxTo.getMonth() + MAX_RANGE_MONTHS);
  if (to > maxTo) {
    throw new AppError("El rango máximo permitido es de 12 meses", 400);
  }

  return { from, to };
}

function previousRange(range: AnalyticsDateRange): AnalyticsDateRange {
  const durationMs = range.to.getTime() - range.from.getTime();
  const previousTo = new Date(range.from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { from: previousFrom, to: previousTo };
}

function dateRangePayload(range: AnalyticsDateRange) {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };
}

async function buildFacts(input: {
  userId: string;
  businessId: string;
  intent: IntentClassification;
}): Promise<ChatbotFacts> {
  const business = await assertBusinessAccess(input);
  const dateRange = normalizeDateRange(input.intent);
  const limit = Math.min(input.intent.limit ?? DEFAULT_LIMIT, 10);
  const scope = {
    userId: input.userId,
    businessId: input.businessId,
    dateRange,
  };

  const base = {
    business: { id: String(business.id), name: business.name },
    dateRange: dateRangePayload(dateRange),
  };

  switch (input.intent.intent) {
    case "sales_summary":
      return { ...base, summary: await getSalesSummary(scope) };
    case "top_products":
      return { ...base, products: await getTopProducts(scope, limit) };
    case "payment_methods":
      return { ...base, paymentMethods: await getPaymentBreakdown(scope) };
    case "sales_channels":
      return { ...base, channels: await getChannelBreakdown(scope) };
    case "locations":
      return { ...base, locations: await getLocationBreakdown(scope, limit) };
    case "customers":
      return { ...base, customers: await getCustomerRanking(scope, limit) };
    case "pending_sales":
      return { ...base, pendingSales: await getPendingSales(scope, limit) };
    case "comparison": {
      const previous = previousRange(dateRange);
      return {
        ...base,
        current: await getSalesSummary(scope),
        previousDateRange: dateRangePayload(previous),
        previous: await getSalesSummary({ ...scope, dateRange: previous }),
      };
    }
    case "unsupported":
      return {
        ...base,
        unsupportedReason:
          input.intent.unsupportedReason ??
          "La pregunta está fuera del alcance de analítica de ventas del MVP.",
      };
  }
}

export async function sendChatbotMessage(input: {
  userId: string;
  payload: ChatbotMessageRequest;
}) {
  if (!input.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const intent = await classifyChatIntent(input.payload.message);
  const facts = await buildFacts({
    userId: input.userId,
    businessId: input.payload.businessId,
    intent,
  });

  if (intent.intent === "unsupported") {
    return {
      answer:
        "Por ahora puedo responder preguntas sobre ventas, productos, canales, métodos de pago, ubicaciones, clientes y cobros pendientes. Todavía no tengo datos de egresos, inventario o metas financieras.",
      intent: intent.intent,
      facts,
      suggestions: [
        "¿Cuánto vendí este mes?",
        "¿Qué producto vendí más?",
        "¿Qué método de pago usan más?",
      ],
    };
  }

  const assistantAnswer = await generateAssistantAnswer({
    question: input.payload.message,
    intent,
    facts,
  });

  return {
    answer: assistantAnswer.answer,
    intent: intent.intent,
    facts,
    suggestions: assistantAnswer.suggestions,
  };
}
