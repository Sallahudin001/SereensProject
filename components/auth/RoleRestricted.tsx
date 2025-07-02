import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUserRole } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

type Props = {
  allowedRoles: ('admin' | 'user')[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Component that only renders its children if the current user has one of the allowed roles
 */
export default function RoleRestricted({ allowedRoles, children, fallback }: Props) {
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
  if (!isSignedIn || !userRole) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Please sign in to access this content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has one of the allowed roles, show children
  if (allowedRoles.includes(userRole as 'admin' | 'user')) {
    return <>{children}</>;
  }

  // Show custom fallback or default 403 message
  if (fallback) return <>{fallback}</>;
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <ShieldX className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-red-700">403 - Access Forbidden</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-gray-600">
            You don't have permission to access this content.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              Required role: <span className="font-semibold">{allowedRoles.join(' or ')}</span>
            </p>
            <p className="text-sm text-red-700">
              Your role: <span className="font-semibold">{userRole}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 