import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const CHATBOT_MAX_REQUESTS = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function limitRequest(
  key: string,
  maxRequests: number,
  res: Response,
  next: NextFunction,
) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({ error: "Too many requests" });
  }

  entry.count += 1;
  return next();
}

export function authLimiter(req: Request, res: Response, next: NextFunction) {
  const key = `auth:${req.ip ?? "unknown"}`;
  return limitRequest(key, MAX_REQUESTS, res, next);
}

export function chatbotLimiter(req: Request, res: Response, next: NextFunction) {
  const key = `chatbot:${req.user?.id ?? req.ip ?? "unknown"}`;
  return limitRequest(key, CHATBOT_MAX_REQUESTS, res, next);
}
