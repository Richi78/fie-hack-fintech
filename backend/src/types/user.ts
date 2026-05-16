export type UserRole = "admin" | "analyst" | "user" | string;

export type AuthenticatedUser = {
  id: bigint;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
};

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};
