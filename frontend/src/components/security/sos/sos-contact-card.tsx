"use client";

import { Phone, Star, User } from "lucide-react";

import { cn } from "@/lib/utils";

type SosContactCardProps = {
  label: string;
  name: string;
  phone: string | null;
  photo?: string | null;
  rating?: number | null;
  className?: string;
};

export default function SosContactCard({
  label,
  name,
  phone,
  photo,
  rating,
  className,
}: SosContactCardProps) {
  const displayRating =
    rating != null && Number.isFinite(rating) ? rating.toFixed(1) : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-100 bg-neutral-50/80 p-3",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="mt-2 flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          {photo ? (
            <img
              src={photo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900">{name}</p>
          {displayRating && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {displayRating}
            </p>
          )}
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-pink-600 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </a>
          ) : (
            <p className="mt-1 text-xs text-neutral-400">No phone on file</p>
          )}
        </div>
      </div>
    </div>
  );
}
