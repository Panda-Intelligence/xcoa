'use client'
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link"
import { useSessionStore } from "@/state/session";
import { useNavStore } from "@/state/nav";
import { usePathname } from "next/navigation";
import { LanguageToggle, useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from '@/lib/utils'

type NavItem = {
  name: string;
  href: Route;
}

const ActionButtons = () => {
  const { session, isLoading } = useSessionStore()
  const { setIsOpen } = useNavStore()
  const { t } = useLanguage()

  if (isLoading) {
    return <Skeleton className="h-10 w-[80px] bg-primary" />
  }

  if (session) {
    return null;
  }

  return (
    <Button asChild onClick={() => setIsOpen(false)}>
      <Link href="/sign-in">{t("common.login")}</Link>
    </Button>
  )
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, isLoading } = useSessionStore()
  const { isOpen, setIsOpen } = useNavStore()
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems: NavItem[] = [
    // { name: t("navigation.home"), href: "/" },
    // ...(session ? [
    //   { name: t("common.dashboard"), href: "/dashboard" },
    // ] as NavItem[] : []),
  ]

  const isActiveLink = (itemHref: string) => {
    if (itemHref === "/") {
      return pathname === "/"
    }
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
  }
  const onInsights = () => {
    window.location.href = "/dashboard/scales/insights";

  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-primary">xCOA</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.features")}
              </a>
              <button
                onClick={onInsights}
                className="text-foreground hover:text-primary transition-colors"
              >
                {t("navigation.scale_interpretation")}
              </button>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.pricing")}
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.about_us")}
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.contact_us")}
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-baseline space-x-4">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16" />
              </>
            ) : (
              navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground no-underline px-3 h-16 flex items-center text-sm font-medium transition-colors relative",
                    isActiveLink(item.href) && "text-foreground after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>
          <LanguageToggle />
          <ActionButtons />

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
                {t("navigation.features")}
              </a>
              <button
                onClick={() => {
                  onInsights?.();
                  setIsMenuOpen(false);
                }}
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-left w-full"
              >
                {t("navigation.scale_interpretation")}
              </button>
              <a
                href="#pricing"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.pricing")}
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.about_us")}
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.contact_us")}
              </a>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-6">
                    <Menu className="w-9 h-9" />
                    <span className="sr-only">{t("actions.more")}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                  <div className="mt-6 flow-root">
                    <div className="space-y-2">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-10 w-full" />
                        </>
                      ) : (
                        <>
                          {navItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={cn(
                                "block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors relative",
                                isActiveLink(item.href) && "text-foreground"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                          <div className="px-3 pt-4">
                            <ActionButtons />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}