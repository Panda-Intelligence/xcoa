import { useSessionStore } from "@/state/session";
import { signOutAction } from "@/actions/sign-out.action";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const useSignOut = () => {
  const { clearSession } = useSessionStore();
  const { t } = useLanguage();

  const signOut = async () => {
    toast.loading(t('auth.signing_out'))
    await signOutAction();
    clearSession();
    await new Promise((resolve) => setTimeout(resolve, 200));
    toast.dismiss()
    toast.success(t('auth.signed_out_successfully'))
  }

  return { signOut }
}

export default useSignOut;
