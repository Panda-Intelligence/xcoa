"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerAction } from "zsa-react";
import { inviteUserAction } from "@/actions/team-membership-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { vm } from "@/lib/validation-messages";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with validation
const formSchema = z.object({  email: z.string().email(vm.email_invalid).min(1, vm.email_required)
});

type FormValues = z.infer<typeof formSchema>;

interface InviteMemberModalProps {
  teamId: string;
  trigger: React.ReactNode;
  onInviteSuccess?: () => void;
}

export function InviteMemberModal({ teamId, trigger, onInviteSuccess }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const { execute } = useServerAction(inviteUserAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || t('team.failed_to_invite_user'));
      console.error("Invite error:", error);
    },
    onStart: () => {
      toast.loading(t('team.sending_invitation'));
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success(t('team.invitation_sent'));
      form.reset();

      if (onInviteSuccess) {
        onInviteSuccess();
      }

      // Close the modal after a short delay
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    }
  });

  const onSubmit = async (data: FormValues) => {
    execute({
      teamId,
      email: data.email,
      roleId: "member", // Default role
      isSystemRole: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('team.invite_member_title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('team.email_address')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('team.email_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('common.cancel')}
                </Button>
              </DialogClose>

              <Button type="submit">
                {t('team.send_invitation')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
