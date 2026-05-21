import { BadgeCheck, Headphones, ShieldCheck, Star } from "lucide-react";

const trustStats = [
  {
    icon: ShieldCheck,
    value: "10K+",
    label: "Safe Rides Completed",
  },
  {
    icon: BadgeCheck,
    value: "5K+",
    label: "Verified Women Drivers",
  },
  {
    icon: Headphones,
    value: "24/7",
    label: "Emergency Support",
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average User Rating",
  },
];

const TrustSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold uppercase text-primary sm:text-4xl">
          Trusted by Women Every Day
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          She Ride is built on verified drivers, real-time safety tools, and a
          women-first community focused on safer travel experiences.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustStats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center shadow-sm transition hover:translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto flex w-16 h-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-4xl text-extrabold text-primary">
                {item.value}
              </h3>

              <p className="mt-2 text-sm font-semibold text-muted-foregrounds">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustSection;
