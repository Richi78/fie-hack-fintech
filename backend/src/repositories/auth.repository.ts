import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import AppError from "../errors/appError.js";

export async function registerUser(userData) {
  const { name, email, password } = userData;

  const passwordHash = await bcrypt.hash(password, 10);

  const userCreated = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!userCreated) {
    throw new AppError("Failed to create user", 500);
  }

  return userCreated;
}
