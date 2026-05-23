import { Eye, Headphones, Users, Ban, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const safetyItems: {
  icon: LucideIcon;
  title: string;
}[] = [
  {
    icon: Headphones,
    title: "24/7 Support",
  },
  {
    icon: Users,
    title: "Strict Community Guidelines",
  },
  {
    icon: Ban,
    title: "Zero Tolerance for Misconduct",
  },
  {
    icon: Eye,
    title: "Continuous Monitoring for Your Safety",
  },
];

const SafetyFeaturesSection = () => {
  return (
    <section id="safety" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 lg:px-12">
      <div className="rounded-3xl bg-primary px-8 py-8 text-primary-foreground shadow-xl lg:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-[180px_1fr]">
          {/* Main Icon */}
          <div className="flex justify-center lg:justify-start">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted/10">
              <ShieldCheck className="h-16 w-16" />
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-center text-2xl font-extrabold uppercase tracking-wide sm:text-3xl lg:text-left">
              Safety isn&apos;t a feature. It&apos;s our foundation
            </h2>

            <div className="mt-5 h-px w-full bg-muted/35" />

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {safetyItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 lg:border-r lg-border-muted/25 lg-pr-5 last:border-r-0"
                  >
                    <Icon className="h-9 w-9 shrink-0" />
                    <p className="text-sm font-semibold leading-5">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyFeaturesSection;
