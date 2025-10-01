import { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import SignInClientPage from "./sign-in.client";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";
import { getAuthMetadata } from "@/utils/server-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getAuthMetadata('sign_in_title');
  const description = await getAuthMetadata('sign_in_description');
  
  return {
    title,
    description,
  };
}

const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const { redirect: redirectParam } = await searchParams;
  const session = await getSessionFromCookie();
  const redirectPath = redirectParam ?? REDIRECT_AFTER_SIGN_IN as unknown as string;

  if (session) {
    return redirect(redirectPath);
  }

  return (
    <SignInClientPage redirectPath={redirectPath} />
  )
}

export default SignInPage;
