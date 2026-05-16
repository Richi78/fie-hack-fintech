import { Router } from "express";
import authRoutes from "./auth.routes.js";
import businessRoutes from "./business.routes.js";
import activityRoutes from "./activity.routes.js";
import saleRoutes from "./sale.routes.js";
import errorHandler from "../middlewares/error.middleware.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

router.use("/auth", authRoutes);
router.use("/businesses", businessRoutes);
router.use("/activities", activityRoutes);
router.use("/sales", saleRoutes);
router.use(errorHandler);

export default router;
