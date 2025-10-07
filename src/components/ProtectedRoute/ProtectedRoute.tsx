"use client"
import { useAuth } from '../AuthComponent/AuthComponent';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !hasRole(allowedRoles)) {
      router.push('/login')
    }
  }, [user, allowedRoles, hasRole, router]);

  if (!user || !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;