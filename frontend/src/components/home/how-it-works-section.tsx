import type { LucideIcon } from "lucide-react";
import { Smartphone, MapPin, CarFront, ShieldCheck, Heart } from "lucide-react";

const steps: {
  icon: LucideIcon;
  title: string;
}[] = [
  {
    icon: Smartphone,
    title: "Download the App",
  },
  {
    icon: MapPin,
    title: "Enter Pickup & Drop",
  },
  {
    icon: CarFront,
    title: "Get a Women Driver",
  },
  {
    icon: ShieldCheck,
    title: "Enjoy a Safe & Comfortable Ride",
  },
  {
    icon: Heart,
    title: "Reach Safely Every time",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <div className="mb-12 flex items-center gap-4">
        <div className="hidden h-px flex-1 bg-primary/40 sm:block" />

        <h2 className="rounded-full bg-primary px-8 py-3 text-center text-2xl font-extrabold text-muted sm:text-3xl">
          HOW IT WORKS
        </h2>

        <div className="hidden h-px flex-1 bg-primary/40 sm:block" />
      </div>

      {/* Steps */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-primary">
                <Icon className="h-12 w-12" />
              </div>

              <span className="mt-5 text-3xl font-extrabold text-primary">
                {index + 1}
              </span>

              <h3 className="mt-2 max-w-32 text-base font-bold leading-5 text-foreground">
                {step.title}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSection;
