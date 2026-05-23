import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import VerificationStatus from "@/components/captain/documents/verification-status";

export default function CaptainDocumentsPage() {
  return (
    <CaptainPageLayout
      title="Documents"
     
    >
      <VerificationStatus />
    </CaptainPageLayout>
  );
}
