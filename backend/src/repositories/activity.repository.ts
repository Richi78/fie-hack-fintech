import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";

export async function createActivity(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  businessId: bigint;
}) {
  const activity = await prisma.activity.create({
    data,
  });
  if (!activity) {
    throw new AppError("Failed to create activity", 500);
  }
  return activity;
}

export async function findActivityById(id: bigint) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      business: true,
      products: true,
    },
  });
}

export async function findActivitiesByBusiness(businessId: bigint) {
  return prisma.activity.findMany({
    where: { businessId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateActivity(
  id: bigint,
  data: Partial<{
    name: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
  }>
) {
  const activity = await prisma.activity.update({
    where: { id },
    data,
  });
  if (!activity) {
    throw new AppError("Activity not found", 404);
  }
  return activity;
}

export async function deleteActivity(id: bigint) {
  await prisma.activity.delete({
    where: { id },
  });
}