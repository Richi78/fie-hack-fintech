import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import AppError from "../errors/appError.js";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterUserData) {
  const { name, email, password } = userData;

  const passwordHash = await bcrypt.hash(password, 10);

  const userCreated = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  if (!userCreated) {
    throw new AppError("Failed to create user", 500);
  }

  return userCreated;
}
