import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import EmergencySosCard from "@/components/captain/safety/emergency-sos-card";
import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

const tips = [
  "Verify passenger OTP before starting the trip.",
  "Share live location with support during night shifts.",
  "Keep emergency contacts updated in your profile.",
  "Report incidents immediately through the app.",
];

export default function CaptainSafetyPage() {
  return (
    <CaptainPageLayout
      title="Safety"
      description="SOS, guidelines, and incident reporting."
    >
      <EmergencySosCard />
      <CaptainCard>
        <h2 className={captainHeading}>Captain safety tips</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {tips.map((tip) => (
            <li key={tip} className="text-sm text-neutral-600">
              {tip}
            </li>
          ))}
        </ul>
      </CaptainCard>
    </CaptainPageLayout>
  );
}
