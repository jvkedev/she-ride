import RoleSelectionGuard from "@/components/auth/role-selection-guard";
import SelectRoleForm from "@/components/auth/select-role-form";

export default function SelectRolePage() {
  return (
    <RoleSelectionGuard>
      <SelectRoleForm />
    </RoleSelectionGuard>
  );
}
