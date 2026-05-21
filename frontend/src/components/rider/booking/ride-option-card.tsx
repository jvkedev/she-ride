"use client";

import Image from "next/image";
import { Clock, Users } from "lucide-react";

import { cn } from "@/lib/utils";

type RideOptionCardProps = {
  name: string;
  seats: number;
  eta: string;
  price: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  active?: boolean;
  onSelect?: () => void;
};

export default function RideOptionCard({
  name,
  seats,
  eta,
  price,
  oldPrice,
  image,
  badge,
  active,
  onSelect,
}: RideOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[110px_1fr_auto] items-center gap-4 rounded-xl border-2 bg-white px-4 py-4 text-left transition",
        active
          ? "border-neutral-900"
          : "border-transparent hover:bg-neutral-50",
      )}
    >
      <div className="relative flex h-16 w-[100px] shrink-0 items-center justify-center">
        <Image
          src={image}
          alt={name}
          width={100}
          height={64}
          unoptimized
          className="h-14 w-auto max-h-14 max-w-[100px] object-contain"
        />
        {badge && (
          <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <Clock className="size-2.5" />
            {badge}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-neutral-900">{name}</h3>
          <span className="flex items-center gap-1 text-sm text-neutral-600">
            <Users className="size-4" />
            {seats}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-neutral-600">{eta}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-neutral-900">{price}</p>
        {oldPrice && (
          <p className="text-sm text-neutral-400 line-through">{oldPrice}</p>
        )}
      </div>
    </button>
  );
}
