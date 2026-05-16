import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import * as activityService from "../services/activity.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";

export const CreateActivitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  businessId: z.coerce.bigint(),
});

export const UpdateActivitySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function createActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = CreateActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const result = await activityService.createActivity(parsed.data);
    return res.status(201).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const result = await activityService.getActivityById(id);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getActivitiesByBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = BigInt(req.params.businessId);
    const result = await activityService.getActivitiesByBusiness(businessId);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function updateActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    const parsed = UpdateActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "Datos inválidos: " +
          parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }
    const result = await activityService.updateActivity(id, parsed.data);
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function deleteActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = BigInt(req.params.id);
    await activityService.deleteActivity(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}