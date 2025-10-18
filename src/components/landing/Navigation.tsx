'use client'
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link"
import { useSessionStore } from "@/state/session";
import { useNavStore } from "@/state/nav";
import { LanguageToggle, useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import ThemeSwitch from "../theme-switch";

const ActionButtons = () => {
  const { session, isLoading } = useSessionStore()
  const { setIsOpen } = useNavStore()
  const { t } = useLanguage()

  if (isLoading) {
    return <Skeleton className="h-10 w-[80px] bg-primary" />
  }

  if (session) {
    return (
      <Button asChild>
        <Link href="/scales/search">{t("common.dashboard")}</Link>
      </Button>
    );
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

  const { t } = useLanguage()

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-[0.5px] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="shrink-0">
                <h1 className="text-xl font-semibold text-primary">Open eCOA</h1>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/#features" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.features")}
              </a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.pricing")}
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.about_us")}
              </a>
            </div>
          </div>

          <div className="flex flex-row gap-4">
            <LanguageToggle />
            <ThemeSwitch />
            <ActionButtons />
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/#features"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.features")}
              </a>
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