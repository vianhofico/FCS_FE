import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function AuditPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="audit"
      title="Audit"
      backendPackage="com.fcs.be.modules.audit"
      notes="Implement activity log browsing with filters and detail traces."
    />
  );
}
