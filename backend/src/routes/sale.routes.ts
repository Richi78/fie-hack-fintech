import { Router } from "express";
import {
  createSale,
  getSale,
  getSalesByBusiness,
  updateSale,
  deleteSale,
  addSaleItem,
  updateSaleItem,
  deleteSaleItem,
} from "../controllers/sale.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authRequired);

router.post("/", createSale);
router.get("/business/:businessId", getSalesByBusiness);
router.get("/:id", getSale);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);
router.post("/:saleId/items", addSaleItem);
router.put("/:saleId/items/:itemId", updateSaleItem);
router.delete("/:saleId/items/:itemId", deleteSaleItem);

export default router;