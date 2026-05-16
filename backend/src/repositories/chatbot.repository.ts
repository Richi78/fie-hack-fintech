import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";
import { SaleStatus, type SaleStatus as SaleStatusType } from "../generated/prisma/client.js";

export type AnalyticsDateRange = {
  from: Date;
  to: Date;
};

type AnalyticsScope = {
  userId: string;
  businessId: string;
  dateRange: AnalyticsDateRange;
};

const REVENUE_STATUSES: SaleStatusType[] = [
  SaleStatus.COBRADO,
  SaleStatus.CONFIRMADO,
];

const PENDING_STATUSES: SaleStatusType[] = [
  SaleStatus.PENDIENTE,
  SaleStatus.CONFIRMADO,
];

function toBigIntId(value: string, label: string) {
  try {
    return BigInt(value);
  } catch {
    throw new AppError(`${label} inválido`, 400);
  }
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

function saleWhere(scope: AnalyticsScope, statuses = REVENUE_STATUSES) {
  return {
    businessId: toBigIntId(scope.businessId, "businessId"),
    status: { in: statuses },
    createdAt: {
      gte: scope.dateRange.from,
      lte: scope.dateRange.to,
    },
  };
}

export async function assertBusinessAccess(scope: Pick<AnalyticsScope, "userId" | "businessId">) {
  const business = await prisma.business.findFirst({
    where: {
      id: toBigIntId(scope.businessId, "businessId"),
      userId: toBigIntId(scope.userId, "userId"),
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!business) {
    throw new AppError("Negocio no encontrado", 404);
  }

  return business;
}

export async function getSalesSummary(scope: AnalyticsScope) {
  const where = saleWhere(scope);
  const [summary, statusBreakdown] = await Promise.all([
    prisma.sale.aggregate({
      where,
      _count: { _all: true },
      _sum: {
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
      },
      _avg: {
        totalAmount: true,
      },
    }),
    prisma.sale.groupBy({
      by: ["status"],
      where: {
        businessId: toBigIntId(scope.businessId, "businessId"),
        createdAt: {
          gte: scope.dateRange.from,
          lte: scope.dateRange.to,
        },
      },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalSales: summary._count._all,
    subtotal: toNumber(summary._sum.subtotal),
    taxAmount: toNumber(summary._sum.taxAmount),
    totalAmount: toNumber(summary._sum.totalAmount),
    averageTicket: toNumber(summary._avg.totalAmount),
    statusBreakdown: statusBreakdown.map((item) => ({
      status: item.status,
      count: item._count._all,
      totalAmount: toNumber(item._sum.totalAmount),
    })),
  };
}

export async function getTopProducts(scope: AnalyticsScope, limit: number) {
  const items = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: saleWhere(scope),
    },
    _sum: {
      quantity: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        subtotal: "desc",
      },
    },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((item) => item.productId) },
      businessId: toBigIntId(scope.businessId, "businessId"),
    },
    select: {
      id: true,
      name: true,
      basePrice: true,
      cost: true,
    },
  });
  const productById = new Map(products.map((product) => [String(product.id), product]));

  return items.map((item) => {
    const product = productById.get(String(item.productId));
    const quantity = toNumber(item._sum.quantity);
    const revenue = toNumber(item._sum.subtotal);
    const cost = toNumber(product?.cost);
    return {
      productId: String(item.productId),
      name: product?.name ?? "Producto sin nombre",
      quantity,
      revenue,
      basePrice: toNumber(product?.basePrice),
      estimatedMargin: cost > 0 ? revenue - cost * quantity : null,
    };
  });
}

export async function getPaymentBreakdown(scope: AnalyticsScope) {
  const rows = await prisma.sale.groupBy({
    by: ["paymentMethodId"],
    where: saleWhere(scope),
    _count: { _all: true },
    _sum: { totalAmount: true },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
  });

  const methods = await prisma.paymentMethod.findMany({
    where: { id: { in: rows.map((row) => row.paymentMethodId) } },
    select: { id: true, name: true, type: true },
  });
  const methodById = new Map(methods.map((method) => [String(method.id), method]));

  return rows.map((row) => {
    const method = methodById.get(String(row.paymentMethodId));
    return {
      paymentMethodId: String(row.paymentMethodId),
      name: method?.name ?? "Método desconocido",
      type: method?.type ?? "OTHER",
      count: row._count._all,
      totalAmount: toNumber(row._sum.totalAmount),
    };
  });
}

export async function getChannelBreakdown(scope: AnalyticsScope) {
  const rows = await prisma.sale.groupBy({
    by: ["channel"],
    where: saleWhere(scope),
    _count: { _all: true },
    _sum: { totalAmount: true },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
  });

  return rows.map((row) => ({
    channel: row.channel,
    count: row._count._all,
    totalAmount: toNumber(row._sum.totalAmount),
  }));
}

export async function getLocationBreakdown(scope: AnalyticsScope, limit: number) {
  const sales = await prisma.sale.findMany({
    where: saleWhere(scope),
    select: {
      locationCity: true,
      locationState: true,
      locationAddress: true,
      totalAmount: true,
    },
  });

  const grouped = new Map<string, { label: string; count: number; totalAmount: number }>();
  for (const sale of sales) {
    const label =
      sale.locationCity ?? sale.locationState ?? sale.locationAddress ?? "Ubicación no registrada";
    const current = grouped.get(label) ?? { label, count: 0, totalAmount: 0 };
    current.count += 1;
    current.totalAmount += toNumber(sale.totalAmount);
    grouped.set(label, current);
  }

  return [...grouped.values()]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

export async function getCustomerRanking(scope: AnalyticsScope, limit: number) {
  const sales = await prisma.sale.findMany({
    where: saleWhere(scope),
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      totalAmount: true,
    },
  });

  const grouped = new Map<string, { customer: string; count: number; totalAmount: number }>();
  for (const sale of sales) {
    const customer = sale.customerName ?? sale.customerPhone ?? sale.customerEmail;
    if (!customer) continue;
    const current = grouped.get(customer) ?? { customer, count: 0, totalAmount: 0 };
    current.count += 1;
    current.totalAmount += toNumber(sale.totalAmount);
    grouped.set(customer, current);
  }

  return [...grouped.values()]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

export async function getPendingSales(scope: AnalyticsScope, limit: number) {
  const sales = await prisma.sale.findMany({
    where: saleWhere(scope, PENDING_STATUSES),
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      customerName: true,
      totalAmount: true,
      status: true,
      channel: true,
      createdAt: true,
    },
  });

  return sales.map((sale) => ({
    id: String(sale.id),
    customerName: sale.customerName,
    totalAmount: toNumber(sale.totalAmount),
    status: sale.status,
    channel: sale.channel,
    createdAt: sale.createdAt.toISOString(),
  }));
}
