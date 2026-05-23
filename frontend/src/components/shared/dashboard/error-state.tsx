import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import SurfaceCard from "@/components/shared/dashboard/surface-card";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <SurfaceCard className="flex flex-col items-center py-10 text-center">
      <AlertCircle className="size-10 text-red-500" />
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4 rounded-lg" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </SurfaceCard>
  );
}
