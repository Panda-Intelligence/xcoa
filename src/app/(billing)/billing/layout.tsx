import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { BillingSidebar } from "./billing-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookie();

  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full flex flex-col">
        <PageHeader
          items={[
            {
              href: "/billing",
              label: "billing.overview"
            }
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <BillingSidebar />
            </aside>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

