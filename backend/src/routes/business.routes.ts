import { Router } from "express";
import {
  createBusiness,
  getBusiness,
  getAllBusinesses,
  updateBusiness,
  deleteBusiness,
} from "../controllers/business.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authRequired);

router.post("/", createBusiness);
router.get("/", getAllBusinesses);
router.get("/:id", getBusiness);
router.put("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;