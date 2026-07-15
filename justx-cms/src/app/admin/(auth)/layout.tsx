import { getSession } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Allow access to login page without session
  const session = await getSession();
  
  return children;
}
