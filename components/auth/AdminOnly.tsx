import { ReactNode } from "react";
import RoleRestricted from "./RoleRestricted";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Component that only renders its children if the current user is an admin
 */
export default function AdminOnly({ children, fallback = null }: Props) {
  return (
    <RoleRestricted allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleRestricted>
  );
} 