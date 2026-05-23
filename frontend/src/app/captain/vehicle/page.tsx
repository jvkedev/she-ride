import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import VehicleDetailsCard from "@/components/captain/vehicle/vehicle-details-card";

export default function CaptainVehiclePage() {
  return (
    <CaptainPageLayout
      title="Vehicle"
      
    >
      <VehicleDetailsCard />
    </CaptainPageLayout>
  );
}
