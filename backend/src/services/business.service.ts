import * as businessRepository from "../repositories/business.repository.js";
import AppError from "../errors/appError.js";

interface CreateBusinessInput {
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  userId: bigint;
}

interface UpdateBusinessInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export async function createBusiness(data: CreateBusinessInput) {
  return businessRepository.createBusiness(data);
}

export async function getBusinessById(id: bigint) {
  const business = await businessRepository.findBusinessById(id);
  if (!business) {
    throw new AppError("Business not found", 404);
  }
  return business;
}

export async function getAllBusinessesByUser(userId: bigint) {
  return businessRepository.findAllBusinessesByUser(userId);
}

export async function updateBusiness(id: bigint, data: UpdateBusinessInput) {
  return businessRepository.updateBusiness(id, data);
}

export async function deleteBusiness(id: bigint) {
  const existing = await businessRepository.findBusinessById(id);
  if (!existing) {
    throw new AppError("Business not found", 404);
  }
  await businessRepository.deleteBusiness(id);
}