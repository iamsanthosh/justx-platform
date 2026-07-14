import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Re-export the edge-safe session utilities so API routes (which run in the
// Node runtime and need both password hashing and sessions) can import
// everything from "@/lib/auth" as before. Middleware imports directly from
// "@/lib/session-edge" to avoid bundling bcryptjs into the Edge runtime.
export * from "./session-edge";
