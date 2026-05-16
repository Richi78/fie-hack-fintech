import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";
import {
  PaymentType,
  SaleChannel,
  SaleStatus,
} from "../src/generated/prisma/client.js";

const SEED_USER = {
  name: "Demo Chatbot",
  email: "chatbot.demo@tinka.test",
  password: "DemoChatbot123!",
  role: "analyst",
};

const BUSINESS_NAME = "Tinka Demo Store";

async function ensurePaymentMethod(input: {
  name: string;
  type: PaymentType;
  sortOrder: number;
  isDefault?: boolean;
}) {
  const existing = await prisma.paymentMethod.findFirst({
    where: { name: input.name, type: input.type },
  });

  if (existing) {
    return prisma.paymentMethod.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        sortOrder: input.sortOrder,
        isDefault: input.isDefault ?? false,
      },
    });
  }

  return prisma.paymentMethod.create({
    data: {
      name: input.name,
      type: input.type,
      sortOrder: input.sortOrder,
      isDefault: input.isDefault ?? false,
      isActive: true,
    },
  });
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  const passwordHash = await bcrypt.hash(SEED_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      name: SEED_USER.name,
      passwordHash,
      role: SEED_USER.role,
    },
    create: {
      name: SEED_USER.name,
      email: SEED_USER.email,
      passwordHash,
      role: SEED_USER.role,
    },
  });

  const existingBusinesses = await prisma.business.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  const seededBusiness = existingBusinesses.find(
    (business) => business.name === BUSINESS_NAME,
  );

  if (seededBusiness) {
    await prisma.saleItem.deleteMany({
      where: {
        sale: {
          businessId: seededBusiness.id,
        },
      },
    });
    await prisma.sale.deleteMany({
      where: { businessId: seededBusiness.id },
    });
    await prisma.product.deleteMany({
      where: { businessId: seededBusiness.id },
    });
    await prisma.activity.deleteMany({
      where: { businessId: seededBusiness.id },
    });
    await prisma.business.delete({
      where: { id: seededBusiness.id },
    });
  }

  const business = await prisma.business.create({
    data: {
      name: BUSINESS_NAME,
      description: "Negocio semilla para probar el chatbot.",
      address: "Zona Sur, La Paz",
      phone: "70000001",
      userId: user.id,
    },
  });

  const [
    cashMethod,
    qrMethod,
    transferMethod,
    walletMethod,
  ] = await Promise.all([
    ensurePaymentMethod({
      name: "Efectivo",
      type: PaymentType.CASH,
      sortOrder: 1,
      isDefault: true,
    }),
    ensurePaymentMethod({
      name: "QR",
      type: PaymentType.WALLET,
      sortOrder: 2,
    }),
    ensurePaymentMethod({
      name: "Transferencia",
      type: PaymentType.TRANSFER,
      sortOrder: 3,
    }),
    ensurePaymentMethod({
      name: "Tarjeta",
      type: PaymentType.CARD,
      sortOrder: 4,
    }),
  ]);

  const ropaActivity = await prisma.activity.create({
    data: {
      businessId: business.id,
      name: "Ropa",
      description: "Productos textiles y accesorios.",
      color: "#ee008a",
    },
  });

  const hogarActivity = await prisma.activity.create({
    data: {
      businessId: business.id,
      name: "Hogar",
      description: "Accesorios de organizacion y regalo.",
      color: "#44c2f4",
    },
  });

  const [polera, tote, termo, agenda] = await Promise.all([
    prisma.product.create({
      data: {
        businessId: business.id,
        activityId: ropaActivity.id,
        name: "Polera Tinka",
        description: "Polera de algodon estampada.",
        sku: `DEMO-POLERA-${business.id}`,
        basePrice: 65,
        cost: 28,
        minPrice: 55,
        maxPrice: 75,
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        activityId: ropaActivity.id,
        name: "Tote Bag Tinka",
        description: "Bolsa reutilizable de tela.",
        sku: `DEMO-TOTE-${business.id}`,
        basePrice: 40,
        cost: 16,
        minPrice: 35,
        maxPrice: 48,
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        activityId: hogarActivity.id,
        name: "Termo Acero",
        description: "Termo metalico de 500 ml.",
        sku: `DEMO-TERMO-${business.id}`,
        basePrice: 95,
        cost: 52,
        minPrice: 88,
        maxPrice: 110,
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        activityId: hogarActivity.id,
        name: "Agenda Emprendedora",
        description: "Agenda semanal para negocios.",
        sku: `DEMO-AGENDA-${business.id}`,
        basePrice: 55,
        cost: 22,
        minPrice: 50,
        maxPrice: 65,
      },
    }),
  ]);

  const saleDefinitions = [
    {
      invoiceNumber: `DEMO-${business.id}-001`,
      status: SaleStatus.COBRADO,
      customerName: "Laura Rojas",
      customerPhone: "71000001",
      channel: SaleChannel.INSTAGRAM,
      paymentMethodId: qrMethod.id,
      locationCity: "La Paz",
      locationState: "La Paz",
      locationAddress: "Zona Sur",
      createdAt: daysAgo(1),
      items: [
        { productId: polera.id, quantity: 2, unitPrice: 65 },
        { productId: tote.id, quantity: 1, unitPrice: 40 },
      ],
    },
    {
      invoiceNumber: `DEMO-${business.id}-002`,
      status: SaleStatus.COBRADO,
      customerName: "Miguel Tola",
      customerPhone: "71000002",
      channel: SaleChannel.WHATSAPP,
      paymentMethodId: cashMethod.id,
      locationCity: "La Paz",
      locationState: "La Paz",
      locationAddress: "Miraflores",
      createdAt: daysAgo(2),
      items: [{ productId: termo.id, quantity: 2, unitPrice: 95 }],
    },
    {
      invoiceNumber: `DEMO-${business.id}-003`,
      status: SaleStatus.CONFIRMADO,
      customerName: "Ana Velasco",
      customerEmail: "ana@example.com",
      channel: SaleChannel.WEB,
      paymentMethodId: transferMethod.id,
      locationCity: "Cochabamba",
      locationState: "Cochabamba",
      locationAddress: "Queru Queru",
      createdAt: daysAgo(3),
      items: [
        { productId: agenda.id, quantity: 3, unitPrice: 55 },
        { productId: tote.id, quantity: 2, unitPrice: 40 },
      ],
    },
    {
      invoiceNumber: `DEMO-${business.id}-004`,
      status: SaleStatus.PENDIENTE,
      customerName: "Carlos Nina",
      customerPhone: "71000003",
      channel: SaleChannel.TIENDA,
      paymentMethodId: walletMethod.id,
      locationCity: "La Paz",
      locationState: "La Paz",
      locationAddress: "San Miguel",
      createdAt: daysAgo(0),
      items: [{ productId: polera.id, quantity: 1, unitPrice: 65 }],
    },
    {
      invoiceNumber: `DEMO-${business.id}-005`,
      status: SaleStatus.COBRADO,
      customerName: "Beatriz Choque",
      customerEmail: "bea@example.com",
      channel: SaleChannel.INSTAGRAM,
      paymentMethodId: qrMethod.id,
      locationCity: "Santa Cruz",
      locationState: "Santa Cruz",
      locationAddress: "Equipetrol",
      createdAt: daysAgo(5),
      items: [
        { productId: termo.id, quantity: 1, unitPrice: 95 },
        { productId: agenda.id, quantity: 2, unitPrice: 55 },
      ],
    },
    {
      invoiceNumber: `DEMO-${business.id}-006`,
      status: SaleStatus.CANCELADO,
      customerName: "Rene Flores",
      channel: SaleChannel.WHATSAPP,
      paymentMethodId: transferMethod.id,
      locationCity: "La Paz",
      locationState: "La Paz",
      locationAddress: "Centro",
      createdAt: daysAgo(4),
      items: [{ productId: tote.id, quantity: 4, unitPrice: 40 }],
    },
    {
      invoiceNumber: `DEMO-${business.id}-007`,
      status: SaleStatus.COBRADO,
      customerName: "Laura Rojas",
      customerPhone: "71000001",
      channel: SaleChannel.PERSONAL,
      paymentMethodId: cashMethod.id,
      locationCity: "El Alto",
      locationState: "La Paz",
      locationAddress: "16 de Julio",
      createdAt: daysAgo(8),
      items: [
        { productId: polera.id, quantity: 1, unitPrice: 65 },
        { productId: agenda.id, quantity: 1, unitPrice: 55 },
      ],
    },
    {
      invoiceNumber: `DEMO-${business.id}-008`,
      status: SaleStatus.REEMBOLSADO,
      customerName: "Pablo M.",
      channel: SaleChannel.WEB,
      paymentMethodId: walletMethod.id,
      locationCity: "Cochabamba",
      locationState: "Cochabamba",
      locationAddress: "Centro",
      createdAt: daysAgo(6),
      items: [{ productId: termo.id, quantity: 1, unitPrice: 95 }],
    },
  ];

  for (const definition of saleDefinitions) {
    const subtotal = definition.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: definition.invoiceNumber,
        status: definition.status,
        subtotal,
        taxAmount: 0,
        totalAmount: subtotal,
        customerName: definition.customerName,
        customerPhone: definition.customerPhone,
        customerEmail: definition.customerEmail,
        locationAddress: definition.locationAddress,
        locationCity: definition.locationCity,
        locationState: definition.locationState,
        channel: definition.channel,
        notes: "Venta semilla para probar el chatbot.",
        createdAt: definition.createdAt,
        updatedAt: definition.createdAt,
        completedAt:
          definition.status === SaleStatus.COBRADO ||
          definition.status === SaleStatus.CONFIRMADO
            ? definition.createdAt
            : null,
        businessId: business.id,
        paymentMethodId: definition.paymentMethodId,
      },
    });

    await prisma.saleItem.createMany({
      data: definition.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        subtotal: item.quantity * item.unitPrice,
        createdAt: definition.createdAt,
      })),
    });
  }

  console.log("Seed completado.");
  console.log(`Usuario: ${SEED_USER.email}`);
  console.log(`Password: ${SEED_USER.password}`);
  console.log(`Business ID: ${String(business.id)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
