import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NavigationProps {
  user?: any;
  onLogin: () => void;
  onLogout: () => void;
  onInsights?: () => void;
}

export function Navigation({ user, onLogin, onLogout, onInsights }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    onLogout();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-primary">eCOA Pro</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                功能特性
              </a>
              <button
                onClick={onInsights}
                className="text-foreground hover:text-primary transition-colors"
              >
                量表解读
              </button>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
                订阅方案
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                关于我们
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                联系我们
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.user_metadata?.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>个人资料</DropdownMenuItem>
                  <DropdownMenuItem>订阅管理</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={onLogin}>登录</Button>
                <Button onClick={onLogin}>免费试用</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-border">
              <a
                href="#features"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                功能特性
              </a>
              <button
                onClick={() => {
                  onInsights?.();
                  setIsMenuOpen(false);
                }}
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-left w-full"
              >
                量表解读
              </button>
              <a
                href="#pricing"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                订阅方案
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                关于我们
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                联系我们
              </a>
              <div className="border-t border-border pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm font-medium">{user.user_metadata?.name || user.email}</div>
                    <Button variant="ghost" className="w-full mb-2">个人资料</Button>
                    <Button variant="ghost" className="w-full mb-2" onClick={handleLogout}>退出登录</Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full mb-2" onClick={onLogin}>登录</Button>
                    <Button className="w-full" onClick={onLogin}>免费试用</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}