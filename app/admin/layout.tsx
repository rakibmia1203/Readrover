import { readSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession();
  if (!s) redirect("/login?next=/admin");
  if (s.role !== "ADMIN") redirect("/");
  return children;
}
