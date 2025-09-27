'use client';

import { PageHeader } from "@/components/page-header";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useLanguage } from "@/hooks/useLanguage";
import { CopyrightHolderManager } from "../_components/copyright-holders/copyright-holder-manager";

export default function AdminCopyrightHoldersPage() {
  const { t } = useLanguage();

  return (
    <NuqsAdapter>
      <PageHeader items={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/copyright-holders", label: "Copyright Holders" }
      ]} />
      <CopyrightHolderManager />
    </NuqsAdapter>
  );
}