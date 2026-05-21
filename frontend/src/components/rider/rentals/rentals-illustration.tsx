import Image from "next/image";

export default function RentalsIllustration() {
  return (
    <div className="relative h-60 w-full shrink-0">
      <Image
        src="/images/rental.png"
        alt="She Ride rental vehicle"
        fill
        priority
        unoptimized
        className="object-cover object-center"
        sizes="400px"
      />
    </div>
  );
}
