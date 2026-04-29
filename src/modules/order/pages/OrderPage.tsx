import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function OrderPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="order"
      title="Order"
      backendPackage="com.fcs.be.modules.order"
      notes="Implement cart, order, voucher and order status-history views."
    />
  );
}
