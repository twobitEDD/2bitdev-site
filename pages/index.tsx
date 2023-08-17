import DefaultLayout from "@/components/app-shell/layouts/default";
import { BouncingArrow } from "@/components/bouncing-arrow";
import { A11yOtb } from "@/components/marketing/a11y-otb";
import { Community } from "@/components/marketing/community";
import { CustomThemes } from "@/components/marketing/custom-themes";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { Hero } from "@/components/marketing/hero";
import { LastButNotLeast } from "@/components/marketing/last-but-not-least";
import landingContent from "@/config/landing";
import { Spacer } from "@nextui-org/react";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center max-w-[1280px] mx-auto">
        <Hero />
        { <div className="my-5 fill-white">
          <BouncingArrow />
        </div> }
        <FeaturesGrid features={landingContent.topFeatures} />
        <CustomThemes />
        <A11yOtb />
        <LastButNotLeast />
        <Community />
        <Spacer y={24} />
      </section>
    </DefaultLayout>
  );
}
