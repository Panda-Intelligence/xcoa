import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import GoogleCallbackClientComponent from "./google-callback.client";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";
import { getAuthMetadata } from "@/utils/server-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getAuthMetadata('google_callback_title');
  const description = await getAuthMetadata('google_callback_description');
  
  return {
    title,
    description,
  };
}

export default async function GoogleCallbackPage() {
  const session = await getSessionFromCookie();

  if (session) {
    return redirect(REDIRECT_AFTER_SIGN_IN);
  }

  return <GoogleCallbackClientComponent />;
}
