"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { accountSecurityApi } from "@/services/security/security-api";
import { useQueryClient } from "@tanstack/react-query";
import { accountKeys } from "@/hooks/security/use-accounts";
import { ShieldAlert } from "lucide-react";

const REASON_OPTIONS = [
  "multiple_failed_logins",
  "vpn_detected",
  "new_device",
  "unusual_location",
  "promo_abuse",
  "suspicious_payment",
  "multiple_accounts",
  "identity_mismatch",
];

export default function FlagAccountDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [riskScore, setRiskScore] = useState("50");
  const [notes, setNotes] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
  };

  const handleSubmit = async () => {
    if (!userId.trim()) return toast.error("User ID is required");
    if (selectedReasons.length === 0)
      return toast.error("Select at least one reason");
    const score = parseFloat(riskScore);
    if (isNaN(score) || score < 0 || score > 100)
      return toast.error("Risk score must be 0–100");

    setLoading(true);
    try {
      await accountSecurityApi.flag({
        userId: userId.trim(),
        reasons: selectedReasons,
        riskScore: score,
        notes: notes.trim() || undefined,
      });
      toast.success("Account flagged successfully");
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      setOpen(false);
      setUserId("");
      setRiskScore("50");
      setNotes("");
      setSelectedReasons([]);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to flag account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-lg gap-2">
          <ShieldAlert className="h-4 w-4" />
          Flag Account
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Flag Suspicious Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User ID */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              User ID
            </label>
            <Input
              className="mt-1 rounded-lg"
              placeholder="Paste user ID from database..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          {/* Risk Score */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Risk Score:{" "}
              <span className="text-primary font-semibold">{riskScore}</span> /
              100
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={riskScore}
              onChange={(e) => setRiskScore(e.target.value)}
              className="mt-1 w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>

          {/* Reasons */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Reasons{" "}
              <span className="text-neutral-400">(select all that apply)</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {REASON_OPTIONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selectedReasons.includes(reason)
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-pink-300"
                  }`}
                >
                  {reason.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Notes <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
              rows={3}
              placeholder="Add investigation notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="w-full rounded-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Flagging..." : "Flag Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
