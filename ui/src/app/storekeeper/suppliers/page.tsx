import { RoleSupplierDirectory } from "@/components/suppliers/RoleSupplierDirectory";

export default function StorekeeperSuppliersPage() {
  return (
    <RoleSupplierDirectory
      title="Supplier Directory"
      description="Review active suppliers and contact details for stock and procurement planning."
      hint="Read-only access for storekeepers to reference suppliers without editing supplier records."
    />
  );
}
