import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { SubscriptionManager } from "../_components/subscription-manager";

export default async function SubscriptionPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return <SubscriptionManager />;
}
