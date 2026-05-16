import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";

export async function createBusiness(data: {
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  userId: bigint;
}) {
  const business = await prisma.business.create({
    data,
  });
  if (!business) {
    throw new AppError("Failed to create business", 500);
  }
  return business;
}

export async function findBusinessById(id: bigint) {
  return prisma.business.findUnique({
    where: { id },
    include: {
      activities: true,
      products: true,
      sales: true,
    },
  });
}

export async function findAllBusinessesByUser(userId: bigint) {
  return prisma.business.findMany({
    where: { userId },
    include: {
      activities: true,
      _count: {
        select: { products: true, sales: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateBusiness(
  id: bigint,
  data: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    address: string;
    phone: string;
    isActive: boolean;
  }>
) {
  const business = await prisma.business.update({
    where: { id },
    data,
  });
  if (!business) {
    throw new AppError("Business not found", 404);
  }
  return business;
}

export async function deleteBusiness(id: bigint) {
  await prisma.business.delete({
    where: { id },
  });
}

export async function findBusinessByUserId(userId: bigint) {
  return prisma.business.findFirst({
    where: { userId },
  });
}