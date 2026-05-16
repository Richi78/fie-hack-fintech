import * as saleRepository from "../repositories/sale.repository.js";
import AppError from "../errors/appError.js";

interface SaleItemInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  notes?: string;
  productId: bigint;
}

interface CreateSaleInput {
  invoiceNumber?: string;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  latitude?: number;
  longitude?: number;
  channel?: string;
  notes?: string;
  businessId: bigint;
  paymentMethodId: bigint;
  items?: SaleItemInput[];
}

interface UpdateSaleInput {
  invoiceNumber?: string;
  status?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  latitude?: number;
  longitude?: number;
  channel?: string;
  notes?: string;
  completedAt?: Date;
  paymentMethodId?: bigint;
}

interface SaleFilters {
  status?: string;
  channel?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function createSale(data: CreateSaleInput) {
  return saleRepository.createSale(data);
}

export async function getSaleById(id: bigint) {
  const sale = await saleRepository.findSaleById(id);
  if (!sale) {
    throw new AppError("Sale not found", 404);
  }
  return sale;
}

export async function getSalesByBusiness(businessId: bigint, filters?: SaleFilters) {
  return saleRepository.findSalesByBusiness(businessId, filters);
}

export async function updateSale(id: bigint, data: UpdateSaleInput) {
  return saleRepository.updateSale(id, data);
}

export async function deleteSale(id: bigint) {
  const existing = await saleRepository.findSaleById(id);
  if (!existing) {
    throw new AppError("Sale not found", 404);
  }
  await saleRepository.deleteSale(id);
}

export async function addSaleItem(saleId: bigint, data: Omit<SaleItemInput, "subtotal">) {
  const subtotal = data.quantity * data.unitPrice - (data.discount || 0);
  return saleRepository.addSaleItem(saleId, { ...data, subtotal });
}

export async function updateSaleItem(id: bigint, data: Partial<Omit<SaleItemInput, "subtotal">>) {
  return saleRepository.updateSaleItem(id, data);
}

export async function deleteSaleItem(id: bigint) {
  await saleRepository.deleteSaleItem(id);
}