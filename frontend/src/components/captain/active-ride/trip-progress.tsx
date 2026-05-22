import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  { id: "pickup", label: "Heading to pickup" },
  { id: "arrived", label: "Arrived at pickup" },
  { id: "trip", label: "Trip in progress" },
  { id: "drop", label: "Reached destination" },
] as const;

type TripProgressProps = {
  currentStep?: (typeof steps)[number]["id"];
};

export default function TripProgress({ currentStep = "trip" }: TripProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isComplete && "border-primary bg-primary text-white",
                  isCurrent && "border-primary bg-white text-primary",
                  !isComplete && !isCurrent && "border-neutral-200 bg-white text-neutral-400",
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-6",
                    isComplete ? "bg-primary" : "bg-neutral-200",
                  )}
                />
              ) : null}
            </div>
            <div className="pb-6 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent || isComplete
                    ? "text-neutral-900"
                    : "text-neutral-400",
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
