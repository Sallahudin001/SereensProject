import { ReactNode } from "react";
import RoleRestricted from "./RoleRestricted";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

// Default fallback component for admin-only content
const DefaultAdminFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] p-4">
    <Card className="w-full max-w-md border-red-200">
      <CardHeader className="text-center">
        <ShieldX className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <CardTitle className="text-red-700">Admin Access Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          This content is restricted to administrators only.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            You need administrator privileges to view this page.
          </p>
        </div>
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

/**
 * Component that only renders its children if the current user is an admin
 */
export default function AdminOnly({ children, fallback }: Props) {
  return (
    <RoleRestricted 
      allowedRoles={['admin']} 
      fallback={fallback || <DefaultAdminFallback />}
    >
      {children}
    </RoleRestricted>
  );
} 