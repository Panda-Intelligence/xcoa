"use client";

import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { createTeamAction } from "@/actions/team-actions";
import { useLanguage } from "@/hooks/useLanguage";
import { vm } from "@/lib/validation-messages";

const formSchema = z.object({
  name: z.string().min(1, vm.team_name_required).max(100, vm.team_name_too_long),
  description: z.string().max(1000, vm.description_too_long).optional(),
  avatarUrl: z.string().url(vm.invalid_url).max(600, vm.url_too_long).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTeamForm() {
  const router = useRouter();
  const { t } = useLanguage();

  const { execute: createTeam } = useServerAction(createTeamAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || t('team.failed_to_create_team'));
    },
    onStart: () => {
      toast.loading(t('team.creating'));
    },
    onSuccess: (result) => {
      toast.dismiss();
      toast.success(t('team.created_successfully'));
      router.push(`/teams/${result.data.data.slug}` as Route);
      router.refresh();
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      avatarUrl: "",
    },
  });

  function onSubmit(data: FormValues) {
    // Clean up empty string in avatarUrl if present
    const formData = {
      ...data,
      avatarUrl: data.avatarUrl || undefined
    };

    createTeam(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('team.team_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('team.team_name_placeholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('team.team_name_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('team.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('team.description_placeholder')}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {t('team.description_helper')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {t('team.create_team')}
        </Button>
      </form>
    </Form>
  );
}
