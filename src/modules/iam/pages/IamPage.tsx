import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function IamPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="iam"
      title="IAM"
      backendPackage="com.fcs.be.modules.iam"
      notes="Implement authentication, authorization, role/permission and profile flows here."
    />
  );
}
