import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function ConsignmentPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="consignment"
      title="Consignment"
      backendPackage="com.fcs.be.modules.consignment"
      notes="Implement consignment request, contract and status-history workflows."
    />
  );
}
