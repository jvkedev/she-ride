import Link from "next/link";
import { notFound } from "next/navigation";

import IncidentInvestigationPanel from "@/components/security/incidents/incident-investigation-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { securityIncidents } from "@/lib/security/mock-data";

type PageProps = { params: Promise<{ id: string }> };

export default async function SecurityIncidentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const incident = securityIncidents.find((i) => i.id === id);
  if (!incident) notFound();

  return (
    <DashboardPageLayout
      title={`Investigation ${incident.id}`}
      description={incident.category}
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/security/incidents">All incidents</Link>
        </Button>
      }
    >
      <IncidentInvestigationPanel incident={incident} />
    </DashboardPageLayout>
  );
}
