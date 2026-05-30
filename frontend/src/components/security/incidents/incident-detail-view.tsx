"use client";

import Link from "next/link";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import IncidentInvestigationPanel from "@/components/security/incidents/incident-investigation-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  incidentId: string;
};

export default function IncidentDetailView({ incidentId }: Props) {
  return (
    <DashboardPageLayout
      wide
      title="Incident investigation"
      description="Review details, assign ownership, and track resolution."
      actions={
        <Button asChild variant="outline" size="sm" className="rounded-lg">
          <Link href="/security/incidents">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to incidents
          </Link>
        </Button>
      }
    >
      <IncidentInvestigationPanel incidentId={incidentId} />
    </DashboardPageLayout>
  );
}
