import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  // 默认重定向到credits页面
  redirect("/billing/credits");
}
