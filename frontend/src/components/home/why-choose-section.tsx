import type { LucideIcon } from "lucide-react";
import {
  UserRound,
  ShieldCheck,
  MessageCircleWarning,
  MapPinned,
  ShieldUser,
  MessagesSquare,
  Star,
  Wallet,
} from "lucide-react";

import FeatureCard from "../shared/feature-card";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: UserRound,
    title: "100% Women Drivers",
    description:
      "Every driver on She Ride is a verified woman for your peace of mind.",
  },
  {
    icon: ShieldCheck,
    title: "In-App Safety Toolkit",
    description:
      "Access safety tools, helplines and one-tap assistance anytime.",
  },
  {
    icon: ShieldUser,
    title: "Verified & Trained Drivers",
    description:
      "Background verified, ID checked and trained for safe & respectful rides.",
  },
  {
    icon: MessageCircleWarning,
    title: "In-App Chat & Call",
    description: "Communicate securely with your driver within the app.",
  },
  {
    icon: MessagesSquare,
    title: "Emergency SOS",
    description:
      "One-tap SOS alert your emergency contacts and share your live location.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description:
      "Rate your ride and help us maintain a safe and trusted community.",
  },
  {
    icon: MapPinned,
    title: "Live Ride Tracking",
    description:
      "Share your live trip with family or friends. They can track you in real-time.",
  },
  {
    icon: Wallet,
    title: "Cashless & Secure Payments",
    description: "Multiple secure payment options for a hessle-free-ride.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      {/* Heading */}
      <div className="mb-14">
        <h2 className="text-3xl font-extrabold text-primary sm:text-3xl">
          WHY CHOOSE SHE RIDE?
        </h2>
        <div className="mt-3 h-1 w-20 rounded-full bg-primary" />
      </div>

      {/* Features */}
      <div className="grid gap-12 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-12 md:border-r-2 md:border-primary/50 md:pr-10">
          {features.slice(0, 4).map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-12 md:pl-10">
          {features.slice(4, 8).map((feature) => (
           <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
