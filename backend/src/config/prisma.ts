import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import AppError from "../errors/appError.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new AppError("DATABASE_URL is not configured", 500);
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
