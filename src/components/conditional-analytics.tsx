"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasAnalyticsConsent, hasCookieConsent } from "./cookie-consent";

export function ConditionalAnalytics() {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    // Check if user has given consent for analytics
    const checkConsent = () => {
      if (hasCookieConsent() && hasAnalyticsConsent()) {
        setShouldLoadAnalytics(true);
      }
    };

    // Check immediately
    checkConsent();

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cookiePreferences" || e.key === "gdpr-consent") {
        checkConsent();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for consent changes in the same tab
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener("cookieConsentChanged", handleConsentChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookieConsentChanged", handleConsentChange);
    };
  }, []);

  // Initialize Google Consent Mode
  useEffect(() => {
    if (typeof window !== "undefined" && !window.gtag) {
      // Initialize gtag with denied consent by default
      window.gtag = function(...args: any[]) {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push(args);
      };
      
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted'
      });
    }
  }, []);

  if (!shouldLoadAnalytics) {
    return null;
  }

  return (
    <Script
      src="https://analytics.ahrefs.com/analytics.js"
      data-key="Vm9gbLxnL4qwA4FmeGc80g"
      strategy="afterInteractive"
      onLoad={() => {
        // Update consent when script loads
        if (window.gtag && hasAnalyticsConsent()) {
          window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
        }
      }}
    />
  );
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}