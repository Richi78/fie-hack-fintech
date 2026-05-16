import { Router, type Router as ExpressRouter } from "express";
import { postChatbotMessage } from "../controllers/chatbot.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";
import { chatbotLimiter } from "../middlewares/rateLimiter.middleware.js";

const router: ExpressRouter = Router();

router.post("/message", authRequired, chatbotLimiter, postChatbotMessage);

export default router;
