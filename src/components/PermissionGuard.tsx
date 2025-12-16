'use client';

import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import { Role, Permission } from '@/types';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: Role[];
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard component
 * Conditionally renders children based on user's role or permission
 * 
 * Usage:
 * - requiredRole: Array of roles that can see the content
 * - requiredPermission: Specific permission required
 * - fallback: Optional content to show when user doesn't have access
 */
export function PermissionGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // If no user, don't render
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <>{fallback}</>;
  }

  // User has access, render children
  return <>{children}</>;
}
