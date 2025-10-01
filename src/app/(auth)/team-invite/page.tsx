import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import TeamInviteClientComponent from "./team-invite.client";
import { getAuthMetadata } from "@/utils/server-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getAuthMetadata('team_invite_title');
  const description = await getAuthMetadata('team_invite_description');
  
  return {
    title,
    description,
  };
}

export default async function TeamInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSessionFromCookie();
  const token = (await searchParams)?.token;

  // If no token is provided, redirect to sign in
  if (!token) {
    return redirect('/sign-in');
  }

  // If user is not logged in, redirect to sign in with return URL
  if (!session) {
    const returnUrl = `/team-invite?token=${token}`;
    return redirect(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
  }

  return <TeamInviteClientComponent />;
}
