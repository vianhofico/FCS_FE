import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function NotificationPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="notification"
      title="Notification"
      backendPackage="com.fcs.be.modules.notification"
      notes="Implement notification listing, read-state and user notification preferences."
    />
  );
}
