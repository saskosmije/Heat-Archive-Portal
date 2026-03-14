import { OpportunityForm } from "@/components/admin/opportunity-form";
import { createOpportunity } from "@/modules/opportunities/actions";

export default function NewOpportunityPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Create Opportunity</h1>
      <div className="bg-surface border border-border rounded-lg p-6">
        <OpportunityForm
          onSave={async (data) => {
            "use server";
            const opp = await createOpportunity(data);
            return { id: opp.id };
          }}
        />
      </div>
    </div>
  );
}
