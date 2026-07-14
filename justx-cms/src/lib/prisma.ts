import { PrismaClient } from "@prisma/client";

// Prevent creating a new PrismaClient on every hot-reload in dev,
// and keep a single pooled connection in production (important on a
// memory-constrained 1vCPU/4GB VPS).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
