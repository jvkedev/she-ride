"use client";

import HeroSection from "@/components/home/hero-section";
import WhyChooseSection from "@/components/home/why-choose-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import WhoIsSheRideForSection from "@/components/home/who-is-sheride-for-section";
import SafetyFeaturesSection from "@/components/home/safety-features-section";
import TrustSection from "@/components/home/trust-section";
import CtaSection from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <WhoIsSheRideForSection />
      <SafetyFeaturesSection />
      <TrustSection />
      <CtaSection />
    </>
  );
}
