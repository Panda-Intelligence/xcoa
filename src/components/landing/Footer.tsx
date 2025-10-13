'use client'
import { Separator } from "@/components/ui/separator";
import { COMPANY_NAME, SITE_NAME } from "@/constants";
import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { openCookiePreferences } from "@/components/cookie-consent";

export function Footer() {
  const { t } = useLanguage();

  const handleCookiePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCookiePreferences();
  };

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{SITE_NAME}</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@openecoa.com</span>
              </div>
              <div className="flex flex-col items-start space-x-2 text-sm text-muted-foreground">
                <div className="flex">
                  <MapPin className="h-4 w-4" />
                  <span className="ml-2">Unit 13, Freeland Park</span>
                </div>
                <div className="flex ml-6!">Wareham Road, Poole</div>
                <div className="flex ml-6!">UK, BH16 6FH</div>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.scale_library")}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.ai_search")}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.data_analysis")}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.help_documentation")}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.research_cases")}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.about_us")}</a></li>
              <li><a href="mailto:support@openecoa.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.contact_us")}</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {COMPANY_NAME}. {t("footer.all_rights_reserved")}.
          </div>
          <div className="flex space-x-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("legal.privacy_policy")}
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("legal.terms_of_service")}
            </a>
            <button 
              type="button"
              onClick={handleCookiePolicyClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent p-0 underline-offset-4 hover:underline"
            >
              {t("legal.cookie_policy")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}