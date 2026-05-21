import type { LucideIcon } from "lucide-react";
import {
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  Luggage,
  HandHeart,
} from "lucide-react";

const audiences: {
  icon: LucideIcon;
  title: string;
}[] = [
  {
    icon: UserRound,
    title: "Daily Commuters",
  },
  {
    icon: GraduationCap,
    title: "Students",
  },
  {
    icon: BriefcaseBusiness,
    title: "Working Women",
  },
  {
    icon: Luggage,
    title: "Traveler",
  },
];

const WhoIsSheRideForSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="mb-14">
        <h2 className="text-3xl font-extrabold text-primary sm:text-3xl">
          WHO IS SHE RIDE FOR?
        </h2>
      </div>

      {/* Audiences */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {audiences.map((audience) => {
          const Icon = audience.icon;

          return (
            <div
              key={audience.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-primary">
                <Icon className="h-12 w-12" />
              </div>

              <h3 className="mt-2 max-w-32 text-base font-bold leading-5 text-foreground">
                {audience.title}
              </h3>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden h-px flex-1 bg-primary/40 sm:block" />

        <div className="flex items-center gap-5 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 text-primary max-w-3xl mx-auto">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <HandHeart className="w-15 h-15" />
          </div>

          {/* Content */}
          <h4 className="max-w-2xl text-lg font-semibold leading-8 sm:text-xl">
            Empowering women to move freely. Going places with confidence.
          </h4>
        </div>

        <div className="hidden h-px flex-1 bg-primary/40 sm:block" />
      </div>
    </section>
  );
};

export default WhoIsSheRideForSection;
