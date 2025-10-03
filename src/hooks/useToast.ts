import { toast } from "sonner";

export const useToast = () => {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId: string | number) => toast.dismiss(toastId),
    confirm: (message: string) => new Promise<boolean>((resolve) => {
      toast(message, {
        action: {
          label: "确认",
          onClick: () => resolve(true),
        },
        cancel: {
          label: "取消",
          onClick: () => resolve(false),
        },
        duration: Infinity,
      });
    }),
  };
};

// 为了向后兼容，提供直接函数
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
};