import IncidentInvestigationPanel from "@/components/security/incidents/incident-investigation-panel";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <IncidentInvestigationPanel incidentId={id} />
    </div>
  );
}
