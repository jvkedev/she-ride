"use client";

import { useState } from "react";
import { Loader2, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CAPTAIN_REPORT_CATEGORIES,
  createCaptainReport,
  type CaptainReportCategory,
} from "@/services/reports/reports.service";
import { cn } from "@/lib/utils";

type ReportCaptainModalProps = {
  rideId: string;
  captainName?: string;
  trigger?: React.ReactNode;
  className?: string;
  onSubmitted?: () => void;
};

export default function ReportCaptainModal({
  rideId,
  captainName,
  trigger,
  className,
  onSubmitted,
}: ReportCaptainModalProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CaptainReportCategory | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!category) {
      setError("Please select a category");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createCaptainReport({
        rideId,
        category,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      onSubmitted?.();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setCategory("");
        setDescription("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
          >
            <Flag className="size-4" />
            Report captain
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report captain</DialogTitle>
          <DialogDescription>
            {captainName
              ? `Tell us what went wrong with ${captainName}. One report per ride.`
              : "Tell us what went wrong. One report per ride."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <p className="py-6 text-center text-sm font-medium text-emerald-700">
            Report submitted. Our team will review it shortly.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Category
              </p>
              <div className="grid max-h-48 gap-2 overflow-y-auto">
                {CAPTAIN_REPORT_CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition",
                      category === item.value
                        ? "border-primary bg-primary/5 font-medium text-neutral-900"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="report-desc"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Details (optional)
              </label>
              <textarea
                id="report-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened..."
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || !category}
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Submit report
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
