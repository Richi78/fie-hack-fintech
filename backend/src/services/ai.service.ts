import { GoogleGenAI, Type } from "@google/genai";
import AppError from "../errors/appError.js";
import { DEFAULTS } from "../config.js";
import {
  assistantAnswerSchema,
  type AssistantAnswer,
  type ChatbotFacts,
  type IntentClassification,
  intentClassificationSchema,
} from "../types/chatbot.js";

const INTENT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: [
        "sales_summary",
        "top_products",
        "payment_methods",
        "sales_channels",
        "locations",
        "customers",
        "pending_sales",
        "comparison",
        "unsupported",
      ],
    },
    dateRange: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        from: { type: Type.STRING },
        to: { type: Type.STRING },
      },
    },
    limit: { type: Type.NUMBER, nullable: true },
    groupBy: { type: Type.STRING, nullable: true },
    unsupportedReason: { type: Type.STRING, nullable: true },
  },
  required: ["intent"],
};

const ANSWER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["answer", "suggestions"],
};

function getGeminiClient() {
  if (DEFAULTS.AI_PROVIDER !== "gemini") {
    throw new AppError("Proveedor de IA no soportado", 503);
  }

  if (!DEFAULTS.GEMINI_API_KEY) {
    throw new AppError("GEMINI_API_KEY no está configurada", 503);
  }

  return new GoogleGenAI({ apiKey: DEFAULTS.GEMINI_API_KEY });
}

function parseJsonResponse<T>(text: string, parser: { parse: (data: unknown) => T }) {
  try {
    return parser.parse(JSON.parse(text));
  } catch {
    throw new AppError("La IA devolvió una respuesta inválida", 502);
  }
}

export async function classifyChatIntent(
  message: string,
): Promise<IntentClassification> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: DEFAULTS.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Clasifica la pregunta de un emprendedor sobre sus ventas.",
              "Devuelve solo JSON válido con el schema indicado.",
              "Usa unsupported si pregunta por egresos, inventario, metas, créditos o datos que no están en ventas.",
              "No inventes fechas: si el usuario no indica periodo, omite dateRange.",
              `Pregunta: ${message}`,
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: INTENT_RESPONSE_SCHEMA,
    },
  });

  return parseJsonResponse(response.text ?? "", intentClassificationSchema);
}

export async function generateAssistantAnswer(input: {
  question: string;
  intent: IntentClassification;
  facts: ChatbotFacts;
}): Promise<AssistantAnswer> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: DEFAULTS.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Eres un asistente financiero y comercial para pequeños emprendedores de Tinka.",
              "Responde en español simple, concreto y accionable.",
              "Usa únicamente los datos del JSON de facts. Si faltan datos, dilo claramente.",
              "No menciones SQL, Prisma ni detalles internos.",
              "Devuelve solo JSON con answer y suggestions.",
              `Pregunta: ${input.question}`,
              `Intent: ${JSON.stringify(input.intent)}`,
              `Facts: ${JSON.stringify(input.facts)}`,
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ANSWER_RESPONSE_SCHEMA,
    },
  });

  return parseJsonResponse(response.text ?? "", assistantAnswerSchema);
}
