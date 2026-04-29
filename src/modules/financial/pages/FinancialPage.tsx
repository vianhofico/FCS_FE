import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function FinancialPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="financial"
      title="Financial"
      backendPackage="com.fcs.be.modules.financial"
      notes="Implement wallet, transaction and withdrawal request/status history screens."
    />
  );
}
