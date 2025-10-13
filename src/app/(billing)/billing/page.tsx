import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  // Redirect to subscription page
  redirect("/billing/subscription");
}
