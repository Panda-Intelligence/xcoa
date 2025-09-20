'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GITHUB_REPO_URL } from "@/constants";
import { useLanguage } from "@/hooks/useLanguage";

export function FAQ() {
  const { t } = useLanguage()

  const faqs = [
    {
      question: t("landing.is_this_template_really_free"),
      answer: (
        <>
          {t("landing.yes_this_template_is_completely_free")} <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">open source</a>!
        </>
      ),
    },
    {
      question: t("landing.what_features_are_included"),
      answer: (
        <>
          {t("landing.template_includes_comprehensive_features")}
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>{t("landing.authentication_with_email_password")}</li>
            <li>{t("landing.database_integration_drizzle_d1")}</li>
            <li>{t("landing.email_service_react_email_resend")}</li>
            <li>{t("landing.modern_ui_components")}</li>
            <li>{t("landing.form_validations_error_handling")}</li>
            <li>{t("landing.dark_mode_support")}</li>
            <li>{t("landing.responsive_design")}</li>
            <li>{t("landing.typescript_throughout")}</li>
            <li>{t("landing.automated_deployments")}</li>
            <li>{t("landing.captcha_integration")}</li>
            <li>{t("landing.seo_optimization")}</li>
            <li>{t("landing.and_countless_other_features")}</li>
          </ul>
        </>
      ),
    },
    {
      question: t("landing.whats_the_tech_stack"),
      answer: (
        <>
          <p>{t("landing.template_uses_modern_reliable_technologies")}</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>{t("landing.nextjs_15_app_router")}</li>
            <li>{t("landing.typescript_for_type_safety")}</li>
            <li>{t("landing.tailwind_shadcn_styling")}</li>
            <li>{t("landing.drizzle_d1_database")}</li>
            <li>{t("landing.lucia_auth_authentication")}</li>
            <li>{t("landing.cloudflare_workers_deployment")}</li>
            <li>{t("landing.cloudflare_kv_session")}</li>
            <li>{t("landing.react_email_templates")}</li>
          </ul>
        </>
      ),
    },
    {
      question: t("landing.how_do_i_deploy_my_application"),
      answer: (
        <>
          <p>{t("landing.deployment_is_automated")}</p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>{t("landing.create_cloudflare_d1_kv")}</li>
            <li>{t("landing.setup_resend_email")}</li>
            <li>{t("landing.configure_turnstile_captcha")}</li>
            <li>{t("landing.add_cloudflare_token_secrets")}</li>
            <li>{t("landing.push_to_main_branch")}</li>
          </ol>
          <p className="mt-2">{t("landing.deployment_process_documented")} <a href={`${GITHUB_REPO_URL}/blob/main/README.md`} target="_blank" rel="noreferrer">GitHub repository</a>.</p>
        </>
      ),
    },
    {
      question: t("landing.what_do_i_need_to_get_started"),
      answer: (
        <>
          <p>{t("landing.need_cloudflare_account")}</p>
          <p className="mt-2">{t("landing.check_documentation")} <a href={`${GITHUB_REPO_URL}/blob/main/README.md`} target="_blank" rel="noreferrer">documentation</a>.</p>
        </>
      ),
    },
    {
      question: t("landing.what_are_upcoming_features"),
      answer: (
        <>
          <p>{t("landing.exciting_roadmap_ahead")}</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>{t("landing.multi_language_support")}</li>
            <li>{t("landing.billing_payment_processing")}</li>
            <li>{t("landing.admin_dashboard")}</li>
            <li>{t("landing.email_verification_signup")}</li>
            <li>{t("landing.notifications_system")}</li>
            <li>{t("landing.webhooks_support")}</li>
            <li>{t("landing.team_collaboration_features")}</li>
            <li>{t("landing.real_time_updates")}</li>
            <li>{t("landing.analytics_dashboard")}</li>
          </ul>
        </>
      ),
    },
    {
      question: t("landing.can_i_preview_email_templates"),
      answer: (
        <>
          {t("landing.yes_run_email_dev")}
        </>
      ),
    },
    {
      question: t("landing.how_do_i_customize_template"),
      answer: (
        <>
          <p>{t("landing.before_deploying_production")}</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>{t("landing.update_project_details_constants")} <code>src/constants.ts</code></li>
            <li>{t("landing.customize_documentation")} <code>./cursor-docs</code></li>
            <li>{t("landing.modify_footer")} <code>src/components/footer.tsx</code></li>
            <li>{t("landing.optionally_update_color_palette")} <code>src/app/globals.css</code></li>
          </ul>
        </>
      ),
    },
    {
      question: t("landing.how_can_i_contribute"),
      answer: (
        <>
          {t("landing.contributions_welcome")} <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">GitHub</a>.
        </>
      ),
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10 dark:divide-gray-100/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight">
            {t("landing.frequently_asked_questions")}
          </h2>
          <Accordion type="single" collapsible className="w-full mt-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question.slice(0, 50)} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert w-full max-w-none">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
