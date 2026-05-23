import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import PaymentsPanel from "@/components/rider/payments/payments-panel";

export default function PaymentsPage() {
  return (
    <RiderPageLayout title="Payments">
      <PaymentsPanel />
    </RiderPageLayout>
  );
}
