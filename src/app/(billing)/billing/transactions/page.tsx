import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { TransactionHistory } from "../_components/transaction-history";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function BillingPage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <NuqsAdapter>
          <TransactionHistory />
        </NuqsAdapter>
      </div>
    </>
  );
}
