import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { InvoiceList } from "../_components/invoice-list";

export default async function InvoicePage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <InvoiceList />
      </div>
    </>
  );
}