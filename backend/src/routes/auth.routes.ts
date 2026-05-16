import { Router, type Router as ExpressRouter } from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router: ExpressRouter = Router();

router.post("/register", registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", authRequired, getMe);

export default router;
