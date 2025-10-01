"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateUserProfileAction } from "./settings.actions";
import { useEffect } from "react";
import { useSessionStore } from "@/state/session";
import { userSettingsSchema } from "@/schemas/settings.schema";
import { useServerAction } from "zsa-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

export function SettingsForm() {
  const router = useRouter()
  const { t } = useLanguage()

  const { execute: updateUserProfile } = useServerAction(updateUserProfileAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message)
    },
    onStart: () => {
      toast.loading(t("settings.signing_in"))
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success(t("settings.signed_in_successfully"))
      router.refresh()
    }
  })

  const { session, isLoading } = useSessionStore();
  const form = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema)
  });

  useEffect(() => {
    form.reset({
      firstName: session?.user.firstName ?? '',
      lastName: session?.user.lastName ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  if (!session || isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-[200px]" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(values: z.infer<typeof userSettingsSchema>) {
    updateUserProfile(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.profile_settings")}</CardTitle>
        <CardDescription>
          {t("settings.profile_settings_description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.first_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.last_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormItem>
              <FormLabel>{t("settings.email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  disabled
                  value={session.user.email ?? ''}
                />
              </FormControl>
              <FormDescription>
                {t("settings.email_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end">
              <Button type="submit">
                {t("settings.save_changes")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
