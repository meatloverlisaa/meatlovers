import { RoleSupplierDirectory } from "@/components/suppliers/RoleSupplierDirectory";

export default function AccountantSuppliersPage() {
  return (
    <RoleSupplierDirectory
      title="Supplier Directory"
      description="Review supplier details for finance references and payment reconciliation."
      hint="Read-only access for accountants to inspect supplier information without editing supplier records."
    />
  );
}
