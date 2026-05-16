import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import { sendChatbotMessage } from "../services/chatbot.service.js";
import { chatbotMessageRequestSchema } from "../types/chatbot.js";

export async function postChatbotMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = chatbotMessageRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Solicitud de chatbot inválida", 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await sendChatbotMessage({
      userId,
      payload: parsed.data,
    });

    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}
