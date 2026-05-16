import * as userRepository from "../repositories/users.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import AppError from "../errors/appError.js";
import { DEFAULTS } from "../config.js";
import type {
  AuthenticatedUser,
  LoginUserInput,
  RegisterUserInput,
} from "../types/user.js";

export async function registerUser(userData: RegisterUserInput) {
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

export async function loginUser(userData: LoginUserInput) {
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

function signToken(user: AuthenticatedUser) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role || "analyst",
  };
  const secret = DEFAULTS.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret is not configured", 500);
  }
  const options: SignOptions = {
    expiresIn: DEFAULTS.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
}

function sanitize<T extends object>(user: T | null) {
  if (!user) return user;
  const { passwordHash, ...rest } = user as T & { passwordHash?: string };
  return rest;
}
