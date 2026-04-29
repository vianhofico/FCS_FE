import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";

export function ProductPage() {
  return (
    <ModulePlaceholderPage
      moduleKey="product"
      title="Product"
      backendPackage="com.fcs.be.modules.product"
      notes="Implement product lifecycle, media asset and warehouse-related flows."
    />
  );
}
