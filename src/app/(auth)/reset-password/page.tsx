import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import ResetPasswordClientComponent from "./reset-password.client";
import { getResetTokenKey } from "@/utils/auth-utils";
import { getAuthMetadata } from "@/utils/server-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getAuthMetadata('reset_password_title');
  const description = await getAuthMetadata('reset_password_description');
  
  return {
    title,
    description,
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const token = (await searchParams).token;

  if (!token) {
    return notFound();
  }

  const { env } = getCloudflareContext();

  if (!env?.NEXT_INC_CACHE_KV) {
    throw new Error("Can't connect to KV store");
  }

  const resetTokenStr = await env.NEXT_INC_CACHE_KV.get(getResetTokenKey(token));

  if (!resetTokenStr) {
    return notFound();
  }

  return <ResetPasswordClientComponent />;
}
