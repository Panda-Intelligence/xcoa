"use client";

import { useState, useEffect } from "react";
import CookieConsent, { getCookieConsentValue, resetCookieConsentValue } from "react-cookie-consent";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Cookie, Settings, Shield, BarChart3 } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const { t } = useLanguage();
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem("cookiePreferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate the parsed object has the expected structure
        if (parsed && typeof parsed === 'object' && 
            'necessary' in parsed && 'functional' in parsed && 
            'analytics' in parsed && 'marketing' in parsed) {
          setPreferences(parsed);
        } else {
          console.warn('Invalid cookie preferences structure, using defaults');
          localStorage.removeItem("cookiePreferences");
        }
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
        localStorage.removeItem("cookiePreferences");
      }
    }

    // Listen for external requests to open cookie preferences
    const handleOpenPreferences = () => {
      setShowPreferences(true);
    };

    window.addEventListener("openCookiePreferences", handleOpenPreferences);

    return () => {
      window.removeEventListener("openCookiePreferences", handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cookieConsentChanged"));

    // Enable analytics scripts if analytics accepted
    if (window.gtag && allAccepted.analytics) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem("cookiePreferences", JSON.stringify(onlyNecessary));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cookieConsentChanged"));
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setShowPreferences(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cookieConsentChanged"));

    // Update consent based on preferences
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied'
      });
    }
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText={t('cookie_consent.accept_all')}
        declineButtonText={t('cookie_consent.reject_non_essential')}
        enableDeclineButton
        onAccept={handleAcceptAll}
        onDecline={handleRejectAll}
        style={{
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          borderTop: "1px solid hsl(var(--border))",
          boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1)",
          padding: "20px",
          fontFamily: "inherit",
        }}
        buttonStyle={{
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          fontSize: "14px",
          fontWeight: "500",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
        declineButtonStyle={{
          background: "hsl(var(--secondary))",
          color: "hsl(var(--secondary-foreground))",
          fontSize: "14px",
          fontWeight: "500",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "1px solid hsl(var(--border))",
          cursor: "pointer",
          marginRight: "10px",
        }}
        expires={365}
        cookieName="gdpr-consent"
      >
        <div className="flex items-start gap-4 max-w-4xl">
          <Cookie className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{t('cookie_consent.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t('cookie_consent.description')}{" "}
              <a href="/privacy" className="text-primary hover:underline">
                {t('cookie_consent.privacy_policy')}
              </a>{" "}
              {t('cookie_consent.learn_more')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                {t('cookie_consent.cookie_settings')}
              </Button>
            </div>
          </div>
        </div>
      </CookieConsent>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[500px] bg-background border border-border shadow-xl backdrop-blur-none fixed top-1/2">
          <div className="relative">
            <DialogHeader className="bg-background">
              <DialogTitle className="flex items-center gap-2 bg-background">
                <Settings className="h-5 w-5" />
                {t('cookie_consent.preferences_title')}
              </DialogTitle>
              <DialogDescription className="bg-background">
                {t('cookie_consent.preferences_description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4 bg-background">
              {/* Necessary Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-success" />
                    <div>
                      <Label className="text-base font-medium">{t('cookie_consent.necessary')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cookie_consent.necessary_description')}
                      </p>
                    </div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>

              <Separator />

              {/* Functional Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-base font-medium">{t('cookie_consent.functional')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cookie_consent.functional_description')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(value) => updatePreference('functional', value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Analytics Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label className="text-base font-medium">{t('cookie_consent.analytics')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cookie_consent.analytics_description')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(value) => updatePreference('analytics', value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Marketing Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cookie className="h-5 w-5 text-orange-600" />
                    <div>
                      <Label className="text-base font-medium">{t('cookie_consent.marketing')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cookie_consent.marketing_description')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(value) => updatePreference('marketing', value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 bg-background">
              <Button onClick={handleSavePreferences} className="flex-1">
                {t('cookie_consent.save_preferences')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreferences(false)}
              >
                {t('cookie_consent.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Utility functions for other components to check consent
export function hasCookieConsent(): boolean {
  return getCookieConsentValue("gdpr-consent") === "true";
}

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === "undefined") {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }
  const saved = localStorage.getItem("cookiePreferences");
  if (!saved) {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }
  
  try {
    const parsed = JSON.parse(saved);
    // Validate the parsed object has the expected structure
    if (parsed && typeof parsed === 'object' && 
        'necessary' in parsed && 'functional' in parsed && 
        'analytics' in parsed && 'marketing' in parsed) {
      return parsed;
    } else {
      console.warn('Invalid cookie preferences structure in storage, using defaults');
      localStorage.removeItem("cookiePreferences");
      return {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };
    }
  } catch (error) {
    console.error('Failed to parse cookie preferences from storage:', error);
    localStorage.removeItem("cookiePreferences");
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }
}

export function hasAnalyticsConsent(): boolean {
  const prefs = getCookiePreferences();
  return hasCookieConsent() && prefs.analytics;
}

export function hasMarketingConsent(): boolean {
  const prefs = getCookiePreferences();
  return hasCookieConsent() && prefs.marketing;
}

export function resetCookieConsent(): void {
  resetCookieConsentValue("gdpr-consent");
  if (typeof window !== "undefined") {
    localStorage.removeItem("cookiePreferences");
  }
}

// Function to open cookie preferences dialog
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("openCookiePreferences"));
  }
}

// Global gtag interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}