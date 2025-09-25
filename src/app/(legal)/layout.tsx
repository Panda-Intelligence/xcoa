import NavFooterLayout from "@/layouts/NavFooterLayout";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <NavFooterLayout renderFooter={false}>
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto px-12 bg-muted/50 rounded-xl py-12">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </NavFooterLayout>
  );
}
