import ProtectedRoute from "./ProtectedRoute";

export default function RoleGuard({ children, roles = [] }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;
}
