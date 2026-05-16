import * as userRepository from "../repositories/users.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../errors/appError.js";
import { DEFAULTS } from "../config.js";

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserRecord {
  id: bigint;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export async function registerUser(userData: RegisterData) {
  const { email } = userData;

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Usuario ya existe", 409);
  }

  const createdUser = await authRepository.registerUser(userData);
  const token = signToken(createdUser);
  return {
    token,
    user: sanitize(createdUser),
  };
}

export async function loginUser(userData: LoginData) {
  const { email, password } = userData;

  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const token = signToken(user);
  return {
    token,
    user: sanitize(user),
  };
}

export async function getUserById(userId: string) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return sanitize(user);
}

function signToken(user: UserRecord) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const secret = DEFAULTS.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret is not configured", 500);
  }
  return jwt.sign(payload, secret, { expiresIn: DEFAULTS.JWT_EXPIRES_IN as string & jwt.SignOptions["expiresIn"] });
}

function sanitize(user: UserRecord) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
}
