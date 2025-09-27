'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/hooks/useLanguage";

interface PageProps {
  params: { holderId: string };
}

export default function AdminCopyrightHolderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // 临时重定向到编辑页面，之后可以创建专门的详情页
  router.push(`/admin/copyright-holders`);

  return (
    <PageHeader
      items={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/copyright-holders", label: "Copyright Holders" },
        { href: "#", label: "详情" }
      ]}
    />
  );
}