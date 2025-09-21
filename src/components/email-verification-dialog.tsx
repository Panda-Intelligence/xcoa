"use client"

import { useSessionStore } from "@/state/session";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS } from "@/constants";
import isProd from "@/utils/is-prod";
import { usePathname } from "next/navigation";
import { Route } from "next";

export function EmailVerificationDialog() {
  const session = useSessionStore((store) => store.session);
  const user = session?.user;
  const pathname = usePathname() as Route;

  if (!user || user.emailVerified || pathname === "/verify-email") {
    return null;
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>邮箱验证</DialogTitle>
          <DialogDescription>
            请验证您的邮箱地址以继续使用平台功能
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm">
            我们已向 <strong>{user.email}</strong> 发送了验证邮件
          </p>
          
          {!isProd && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>开发模式:</strong> 验证链接已在控制台显示
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              重新发送
            </Button>
            <span className="text-xs text-muted-foreground">
              链接将在 {Math.floor(EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS / 3600)} 小时后过期
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}