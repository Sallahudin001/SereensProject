import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUserRole } from "@/lib/auth-utils";

type Props = {
  allowedRoles: ('admin' | 'user')[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Component that only renders its children if the current user has one of the allowed roles
 */
export default function RoleRestricted({ allowedRoles, children, fallback = null }: Props) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !isSignedIn || !userId) {
        setLoading(false);
        return;
      }

      try {
        // Call our API to get the user's role
        const response = await fetch('/api/direct-user-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkRoleOnly: true }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(data.user.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [userId, isLoaded, isSignedIn]);

  // While loading, show nothing
  if (loading) return null;

  // If not signed in or no role, show fallback
  if (!isSignedIn || !userRole) return <>{fallback}</>;

  // If user has one of the allowed roles, show children
  if (allowedRoles.includes(userRole as 'admin' | 'user')) {
    return <>{children}</>;
  }

  // Otherwise show fallback
  return <>{fallback}</>;
} 