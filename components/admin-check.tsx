"use client";

import { useUser } from "@clerk/nextjs";

// Custom hook to check if user is an admin
export function useIsAdmin() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return { isAdmin: false, isLoaded: false };
  }
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  return { isAdmin, isLoaded: true };
}

// Admin guard component for client-side protection
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoaded } = useIsAdmin();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-rose-50 text-rose-800 p-6 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">
            You don't have permission to access this page. This area is restricted to administrators.
          </p>
          <a
            href="/"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 