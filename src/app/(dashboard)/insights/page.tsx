import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  redirect("/scales");
}
