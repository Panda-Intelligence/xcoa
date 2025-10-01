import { Metadata } from "next";
import ForgotPasswordClientComponent from "./forgot-password.client";
import { getAuthMetadata } from "@/utils/server-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getAuthMetadata('forgot_password_title');
  const description = await getAuthMetadata('forgot_password_description');
  
  return {
    title,
    description,
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientComponent />;
}
