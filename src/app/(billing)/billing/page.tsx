import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { CreditPackages } from "./_components/credit-packages";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreditPackages />
    </div>
  );
}
