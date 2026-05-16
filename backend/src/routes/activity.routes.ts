import { Router } from "express";
import {
  createActivity,
  getActivity,
  getActivitiesByBusiness,
  updateActivity,
  deleteActivity,
} from "../controllers/activity.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authRequired);

router.post("/", createActivity);
router.get("/business/:businessId", getActivitiesByBusiness);
router.get("/:id", getActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

export default router;