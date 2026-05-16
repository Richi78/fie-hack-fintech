import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";

export async function createSale(data: {
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
  items?: Array<{
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
    notes?: string;
    productId: bigint;
  }>;
}) {
  const sale = await prisma.sale.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      locationAddress: data.locationAddress,
      locationCity: data.locationCity,
      locationState: data.locationState,
      latitude: data.latitude,
      longitude: data.longitude,
      channel: data.channel as any || "PERSONAL",
      notes: data.notes,
      businessId: data.businessId,
      paymentMethodId: data.paymentMethodId,
      items: data.items
        ? {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              subtotal: item.subtotal,
              notes: item.notes,
              productId: item.productId,
            })),
          }
        : undefined,
    },
    include: {
      items: true,
      paymentMethod: true,
      business: true,
    },
  });
  if (!sale) {
    throw new AppError("Failed to create sale", 500);
  }
  return sale;
}

export async function findSaleById(id: bigint) {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      paymentMethod: true,
      business: true,
    },
  });
}

export async function findSalesByBusiness(businessId: bigint, opts?: {
  status?: string;
  channel?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = { businessId };
  if (opts?.status) where.status = opts.status;
  if (opts?.channel) where.channel = opts.channel;
  if (opts?.startDate || opts?.endDate) {
    where.createdAt = {};
    if (opts.startDate) where.createdAt.gte = opts.startDate;
    if (opts.endDate) where.createdAt.lte = opts.endDate;
  }

  return prisma.sale.findMany({
    where,
    include: {
      items: true,
      paymentMethod: true,
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit || 50,
    skip: opts?.offset || 0,
  });
}

export async function updateSale(
  id: bigint,
  data: any
) {
  const sale = await prisma.sale.update({
    where: { id },
    data,
    include: {
      items: true,
      paymentMethod: true,
    },
  });
  if (!sale) {
    throw new AppError("Sale not found", 404);
  }
  return sale;
}

export async function deleteSale(id: bigint) {
  await prisma.sale.delete({
    where: { id },
  });
}

export async function addSaleItem(saleId: bigint, data: {
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  notes?: string;
  productId: bigint;
}) {
  return prisma.saleItem.create({
    data: {
      ...data,
      saleId,
    },
    include: {
      product: true,
    },
  });
}

export async function updateSaleItem(
  id: bigint,
  data: Partial<{
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    notes: string;
  }>
) {
  return prisma.saleItem.update({
    where: { id },
    data,
    include: {
      product: true,
    },
  });
}

export async function deleteSaleItem(id: bigint) {
  await prisma.saleItem.delete({
    where: { id },
  });
}