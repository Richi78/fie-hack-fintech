import { Router, type Router as ExpressRouter } from "express";
import authRoutes from "./auth.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import errorHandler from "../middlewares/error.middleware.js";

const router: ExpressRouter = Router();

router.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

router.use("/auth", authRoutes);
router.use("/chatbot", chatbotRoutes);
router.use(errorHandler);

export default router;
