import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  // Default redirect to credits page
  redirect("/billing/credits");
}
