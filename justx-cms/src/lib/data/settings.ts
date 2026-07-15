import { prisma } from "@/lib/prisma";

/** Fetches a single setting value by key, or null if not set. */
export async function getSetting(key: string): Promise<unknown | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}
