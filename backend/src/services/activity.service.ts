import * as activityRepository from "../repositories/activity.repository.js";
import AppError from "../errors/appError.js";

interface CreateActivityInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  businessId: bigint;
}

interface UpdateActivityInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export async function createActivity(data: CreateActivityInput) {
  return activityRepository.createActivity(data);
}

export async function getActivityById(id: bigint) {
  const activity = await activityRepository.findActivityById(id);
  if (!activity) {
    throw new AppError("Activity not found", 404);
  }
  return activity;
}

export async function getActivitiesByBusiness(businessId: bigint) {
  return activityRepository.findActivitiesByBusiness(businessId);
}

export async function updateActivity(id: bigint, data: UpdateActivityInput) {
  return activityRepository.updateActivity(id, data);
}

export async function deleteActivity(id: bigint) {
  const existing = await activityRepository.findActivityById(id);
  if (!existing) {
    throw new AppError("Activity not found", 404);
  }
  await activityRepository.deleteActivity(id);
}