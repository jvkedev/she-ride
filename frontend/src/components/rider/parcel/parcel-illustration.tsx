import Image from "next/image";

export default function ParcelIllustration() {
  return (
    <div className="relative h-60 w-full shrink-0">
      <Image
        src="/images/parcel.png"
        alt="Courier delivery"
        fill
        priority
        unoptimized
        className="object-cover object-center"
        sizes="400px"
      />
    </div>
  );
}
