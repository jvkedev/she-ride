import CaptainRideHistoryCard from "@/components/captain/history/captain-ride-history-card";
import { rideHistoryItems } from "@/lib/captain/captain-mock-data";

export default function CaptainRideHistoryList() {
  return (
    <div className="space-y-3">
      {rideHistoryItems.map((item) => (
        <CaptainRideHistoryCard
          key={item.id}
          passenger={item.passenger}
          route={item.route}
          fare={item.fare}
          date={item.date}
          status={item.status}
        />
      ))}
    </div>
  );
}
