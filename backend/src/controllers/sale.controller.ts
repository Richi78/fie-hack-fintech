import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import * as saleService from "../services/sale.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";

const decimalSchema = z.coerce.number();

export const CreateSaleSchema = z.object({
  invoiceNumber: z.string().optional(),
  subtotal: decimalSchema,
  taxAmount: decimalSchema.optional(),
  totalAmount: decimalSchema,
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  locationAddress: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  latitude: decimalSchema.optional(),
  longitude: decimalSchema.optional(),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "WEB", "TIENDA", "PERSONAL", "OTRO"]).optional(),
  notes: z.string().optional(),
  businessId: z.coerce.bigint(),
  paymentMethodId: z.coerce.bigint(),
  items: z.array(z.object({
    quantity: decimalSchema,
    unitPrice: decimalSchema,
    discount: decimalSchema.optional(),
    notes: z.string().optional(),
    productId: z.coerce.bigint(),
  })).optional(),
});

export const UpdateSaleSchema = z.object({
  invoiceNumber: z.string().optional(),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "COBRADO", "CANCELADO", "REEMBOLSADO"]).optional(),
  subtotal: decimalSchema.optional(),
  taxAmount: decimalSchema.optional(),
  totalAmount: decimalSchema.optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  locationAddress: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  latitude: decimalSchema.optional(),
  longitude: decimalSchema.optional(),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "WEB", "TIENDA", "PERSONAL", "OTRO"]).optional(),
  notes: z.string().optional(),
  completedAt: z.coerce.date().optional(),
  paymentMethodId: z.coerce.bigint().optional(),
});

export const SaleFiltersSchema = z.object({
  status: z.enum(["PENDIENTE", "CONFIRMADO", "COBRADO", "CANCELADO", "REEMBOLSADO"]).optional(),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "WEB", "TIENDA", "PERSONAL", "OTRO"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const AddSaleItemSchema = z.object({
  quantity: decimalSchema,
  unitPrice: decimalSchema,
  discount: decimalSchema.optional(),
  notes: z.string().optional(),
  productId: z.coerce.bigint(),
});

export async function createSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = CreateSaleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const result = await saleService.createSale({
      ...parsed.data,
      subtotal: Number(parsed.data.subtotal),
      taxAmount: parsed.data.taxAmount ? Number(parsed.data.taxAmount) : undefined,
      totalAmount: Number(parsed.data.totalAmount),
      latitude: parsed.data.latitude ? Number(parsed.data.latitude) : undefined,
      longitude: parsed.data.longitude ? Number(parsed.data.longitude) : undefined,
      items: parsed.data.items?.map((item) => ({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: item.discount ? Number(item.discount) : undefined,
        subtotal: Number(item.quantity) * Number(item.unitPrice) - (item.discount ? Number(item.discount) : 0),
        notes: item.notes,
        productId: item.productId,
      })),
    });
    return res.status(201).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const result = await saleService.getSaleById(id);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getSalesByBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = BigInt(req.params.businessId);
    const parsed = SaleFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError("Filtros inválidos", 400);
    }
    const result = await saleService.getSalesByBusiness(businessId, parsed.data);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function updateSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const parsed = UpdateSaleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const data: any = { ...parsed.data };
    if (data.subtotal) data.subtotal = Number(data.subtotal);
    if (data.taxAmount) data.taxAmount = Number(data.taxAmount);
    if (data.totalAmount) data.totalAmount = Number(data.totalAmount);
    if (data.latitude) data.latitude = Number(data.latitude);
    if (data.longitude) data.longitude = Number(data.longitude);
    const result = await saleService.updateSale(id, data);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function deleteSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    await saleService.deleteSale(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function addSaleItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const saleId = BigInt(req.params.saleId);
    const parsed = AddSaleItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const result = await saleService.addSaleItem(saleId, {
      quantity: Number(parsed.data.quantity),
      unitPrice: Number(parsed.data.unitPrice),
      discount: parsed.data.discount ? Number(parsed.data.discount) : undefined,
      notes: parsed.data.notes,
      productId: parsed.data.productId,
    });
    return res.status(201).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function updateSaleItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.itemId);
    const parsed = AddSaleItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const data: any = { ...parsed.data };
    if (data.quantity) data.quantity = Number(data.quantity);
    if (data.unitPrice) data.unitPrice = Number(data.unitPrice);
    if (data.discount) data.discount = Number(data.discount);
    const result = await saleService.updateSaleItem(id, data);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function deleteSaleItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.itemId);
    await saleService.deleteSaleItem(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}