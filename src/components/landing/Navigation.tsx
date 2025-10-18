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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="shrink-0">
                <svg
                  width="128"
                  height="112"
                  viewBox="0 0 1024 896"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path
                    fill="currentColor"
                    opacity="1.000000"
                    stroke="none"
                    d="M404.068817,557.240112 C359.265808,570.220764 314.859833,583.118408 270.654999,595.957642 C268.885223,593.945068 270.203766,592.744568 270.912201,591.539307 C301.468781,539.555664 332.021667,487.569824 362.660156,435.634460 C364.762024,432.071594 365.818970,428.553467 365.812500,424.362976 C365.725525,368.042877 365.843353,311.722382 365.684662,255.402603 C365.670776,250.469849 367.209991,248.522430 371.952179,247.241028 C427.862701,232.133255 483.722961,216.838409 539.548401,201.418869 C543.424866,200.348160 546.813965,201.112198 550.282959,202.089188 C603.456787,217.065109 656.599854,232.150238 709.779236,247.106323 C723.434631,250.946732 721.015320,249.014404 721.055725,261.905518 C721.232178,318.225372 721.157471,374.545959 721.283386,430.866028 C721.291809,434.620422 719.840942,437.607758 718.080627,440.641022 C694.092773,481.976105 670.105896,523.311768 646.128113,564.652710 C641.198425,573.152039 636.198975,581.613892 631.449951,590.213562 C629.527039,593.695557 627.467651,594.675720 623.428101,593.470032 C568.242981,576.997559 513.004150,560.705078 457.783966,544.349915 C455.209290,543.587341 452.745941,542.941528 449.983795,543.766724 C434.830261,548.294128 419.642090,552.705750 404.068817,557.240112 M527.562927,245.992584 C505.731567,283.372772 483.907837,320.757416 462.047028,358.120361 C460.922638,360.042084 460.232971,361.947937 460.220459,364.217102 C459.918610,418.860474 459.598694,473.503845 459.177185,528.146362 C459.150726,531.574524 460.317810,533.248840 463.618622,534.159729 C473.885620,536.992981 484.091705,540.048462 494.309387,543.058594 C534.225037,554.817566 574.097168,566.726624 614.075439,578.268494 C624.295898,581.219177 622.053589,582.669373 627.564575,573.231262 C648.984009,536.548401 670.297607,499.803741 691.626038,463.067871 C695.247681,456.829956 698.748718,450.522003 702.855042,443.276764 C685.671570,448.181519 669.712524,452.738251 653.752686,457.292053 C619.816711,466.974976 585.855896,476.572296 551.968567,486.422791 C546.443726,488.028717 541.456360,487.913452 535.961426,486.208496 C517.523621,480.487854 498.943176,475.227203 480.423523,469.769501 C475.896027,468.435242 473.940613,464.278137 475.947998,458.986450 C477.580688,454.682617 480.814819,457.745209 483.055359,458.396606 C502.391083,464.018707 521.671875,469.830902 540.945984,475.662445 C543.119019,476.319946 545.090637,476.254913 547.245605,475.636139 C581.156372,465.898804 615.083069,456.217499 649.004822,446.518646 C667.562988,441.212494 686.121582,435.907349 704.672180,430.574707 C707.049255,429.891388 709.213806,429.461151 709.202209,425.829956 C709.038147,374.509583 709.043823,323.188599 709.029358,271.867767 C709.025757,259.150757 709.092346,259.037811 696.752686,255.527054 C648.422974,241.776764 600.060547,228.141342 551.747681,214.332336 C547.851074,213.218582 545.720459,214.013596 543.774658,217.596664 C538.690979,226.958099 533.248413,236.124649 527.562927,245.992584 M324.813660,568.191956 C328.808044,567.023865 332.801880,565.853821 336.796875,564.687927 C371.955017,554.427612 407.108002,544.149658 442.280518,533.938843 C445.578796,532.981323 447.712006,531.931824 447.727844,527.660095 C447.929626,473.337280 448.329803,419.015167 448.742798,364.693329 C448.764221,361.875580 448.054077,359.574463 446.316223,357.343658 C428.806488,334.867584 411.363007,312.339935 393.898560,289.828552 C389.044189,283.571381 384.181946,277.320312 378.546692,270.066803 C377.460754,278.600403 377.932312,285.842926 377.944519,293.080231 C378.015564,335.243469 378.022217,377.406830 378.022369,419.570129 C378.022400,427.602936 377.966034,427.596222 385.914093,429.920502 C387.991486,430.527985 390.045593,431.215179 392.122253,431.825348 C403.784363,435.252045 415.453278,438.655701 427.112885,442.090881 C430.873871,443.198975 433.289368,448.791901 431.536774,452.992767 C429.827362,457.090210 426.879364,454.124603 424.775391,453.524689 C409.568054,449.188629 394.408264,444.680054 379.290192,440.041107 C375.856110,438.987366 373.778992,439.458435 371.993195,442.833710 C368.724701,449.011230 365.033020,454.965912 361.484619,460.993988 C340.191559,497.166992 318.877899,533.327942 297.619507,569.521301 C296.434143,571.539429 294.757629,573.480164 294.812103,576.913879 C304.939056,573.984741 314.497772,571.219910 324.813660,568.191956 M437.113037,241.743134 C419.417023,246.654953 401.721039,251.566772 383.434998,256.642365 C407.168152,287.420074 430.276520,317.387543 453.915405,348.043030 C479.883148,303.807220 505.220917,260.644592 530.558716,217.481949 C530.263611,217.159653 529.968506,216.837372 529.673401,216.515076 C499.076752,224.838333 468.480133,233.161575 437.113037,241.743134 z"
                  />
                </svg>
              </div>
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
              <Link href="/blog" className="text-foreground hover:text-primary transition-colors">
                {t("navigation.blog")}
              </Link>
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
              <Link
                href="/blog"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.blog")}
              </Link>
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