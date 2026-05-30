"use client";

import { useEffect, useState } from "react";
import { Clock, IndianRupee, Star, TrendingUp } from "lucide-react";

import CaptainStatWidget from "@/components/captain/shared/captain-stat-widget";
import { useCaptainProfile } from "@/hooks/captain/use-captain-profile";
import { getCaptainDashboard } from "@/services/captain/captain-dashboard.service";

export default function CaptainStatsCards() {
  const [trips, setTrips] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: profile } = useCaptainProfile();

  useEffect(() => {
    getCaptainDashboard()
      .then((dashboard) => {
        setTrips(dashboard.today.trips);
        setEarnings(dashboard.today.earnings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rating = profile?.rating ?? 5;
  const totalTrips = profile?.totalTrips ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CaptainStatWidget
        label="Trips today"
        value={loading ? "…" : String(trips)}
        hint={loading ? "" : `${totalTrips} total completed`}
        icon={TrendingUp}
        accent="primary"
      />
      <CaptainStatWidget
        label="Earnings today"
        value={loading ? "…" : `₹${earnings.toLocaleString("en-IN")}`}
        hint="From completed trips"
        icon={IndianRupee}
        accent="primary"
      />
      <CaptainStatWidget
        label="Rating"
        value={loading ? "…" : rating.toFixed(2)}
        hint="Captain rating"
        icon={Star}
      />
      <CaptainStatWidget
        label="Status"
        value={loading ? "…" : "Online ready"}
        hint="Toggle online in header"
        icon={Clock}
      />
    </div>
  );
}
