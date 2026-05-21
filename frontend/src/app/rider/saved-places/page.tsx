import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import SavedPlacesPanel from "@/components/rider/saved-places/saved-places-panel";

export default function SavedPlacesPage() {
  return (
    <RiderPageLayout
      title="Saved Places"
      description="Quick access to your frequent destinations"
    >
      <SavedPlacesPanel />
    </RiderPageLayout>
  );
}
