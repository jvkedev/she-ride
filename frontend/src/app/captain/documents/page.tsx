import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import VerificationStatus from "@/components/captain/documents/verification-status";

export default function CaptainDocumentsPage() {
  return (
    <CaptainPageLayout
      title="Documents"
      description="Upload and verify required captain documents."
    >
      <VerificationStatus />
    </CaptainPageLayout>
  );
}
