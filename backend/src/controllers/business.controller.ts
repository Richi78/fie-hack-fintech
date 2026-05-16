import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import * as businessService from "../services/business.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";

export const CreateBusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function createBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = CreateBusinessSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Datos inválidos: " + parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "), 400);
    }
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const result = await businessService.createBusiness({
      ...parsed.data,
      userId: BigInt(userId),
    });
    return res.status(201).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const result = await businessService.getBusinessById(id);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getAllBusinesses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const result = await businessService.getAllBusinessesByUser(BigInt(userId));
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function updateBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const parsed = UpdateBusinessSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Datos inválidos: " + parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "), 400);
    }
    const result = await businessService.updateBusiness(id, parsed.data);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function deleteBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    await businessService.deleteBusiness(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}