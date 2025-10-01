"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "./reset-password.action";
import { useServerAction } from "zsa-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/schemas/reset-password.schema";
import type { ResetPasswordSchema } from "@/schemas/reset-password.schema";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ResetPasswordClientComponent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      form.setValue("token", token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const { execute: resetPassword, isSuccess } = useServerAction(resetPasswordAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message);
    },
    onStart: () => {
      toast.loading(t('auth.resetPassword.resettingPassword'));
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success(t('auth.resetPassword.passwordResetSuccessfully'));
    },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    resetPassword(data);
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.resetPassword.passwordResetSuccessTitle')}</CardTitle>
            <CardDescription>
              {t('auth.resetPassword.passwordResetSuccessMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/sign-in")}
            >
              {t('auth.resetPassword.goToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.resetPassword.resetPassword')}</CardTitle>
          <CardDescription>
            {t('auth.resetPassword.enterNewPassword')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('auth.resetPassword.resetPassword')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
