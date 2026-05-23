import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

const CtaSection = () => {
  return (
    <section id="support" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 lg:px-12">
      <div className="relative overflow-hidden rounded-4xl bg-primary px-8 py-16 text-primary-foreground shadow-xl sm:px-12">
        <div className="absolute -left-20 top-0 h-72 rounded-full bg-muted/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-88 rounded-full bg-muted/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Small Badge */}
          <div className="mb-6 rounded-full border border-muted/20 bg-muted/10 px-5 py-2 text-sm font-semibold backdrop-blur-sm flex justify-center items-center gap-2 w-73">
          <ShieldCheck className="w-5 h5" />
            Trusted by Thousands of Women
          </div>

          {/* Heading */}
          <h2 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Ready to Ride Safer?
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-primary-foreground/90 sm:text-lg">
            Join thousands of women who trust SheRide for safer, smarter, and
            more comfortable everyday travel.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-muted px-8 text-lg font-bold text-primary hover:bg-muted/90"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full border border-muted/30 bg-muted/10 px-8 py-4 text-lg font-semibold text-muted backdrop:blur-sm transition hover:bg-muted/20 hover:text-muted"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
