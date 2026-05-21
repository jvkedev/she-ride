import Image from "next/image";
import { ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-2 lg:px-12">
      {/* Left Content */}
      <div className="space-y-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-5xl">
            Safe & Secure Rides
          </h1>
          <h2 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
            for Women, by Women.
          </h2>
        </div>
        <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          She Ride is a women-first ride-hailing platform where every ride, every
          driver, and every step is designed with your safety, comfort, and
          confidence in mind.
          <span className="hidden md:inline">
            {" "}
            From verified women drivers and live ride tracking to emergency SOS
            support and secure in-app communication, SheRide creates a trusted
            travel experience that empowers women to move freely, safely, and
            independently anytime, anywhere.
          </span>
        </p>
        {/* CTA */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md sm:text-base">
          <ShieldCheck className="h-5 w-5" />
          <span>Your Safety, Our Priority</span>
        </div>
      </div>
      {/* Right Content */}
      <div className="flex justify-center md:justify-end">
        <Image
          src="/images/hero-image.png"
          alt="hero-image"
          width={1000}
          height={1000}
          priority
          className="h-auto w-full max-w-sm object-contain sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl"
        />
      </div>
    </section>
  );
};

export default HeroSection;
