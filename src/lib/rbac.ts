import { Role, Permission, Country, UserWithoutPassword } from '@/types';

/**
 * RBAC Permission Matrix
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view_restaurants',
    'create_order',
    'place_order',
    'cancel_order',
    'manage_payments',
  ],
  manager: [
    'view_restaurants',
    'create_order',
    'place_order',
    'cancel_order',
  ],
  member: [
    'view_restaurants',
    'create_order',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a user can access data from a specific country
 * - Admin can access all countries
 * - Manager and Member can only access their own country
 */
export function canAccessCountry(
  user: UserWithoutPassword,
  targetCountry: Country
): boolean {
  if (user.role === 'admin') {
    return true;
  }
  return user.country === targetCountry;
}

/**
 * Check if a user can perform an action
 * Combines role permission check
 */
export function canPerformAction(
  user: UserWithoutPassword,
  permission: Permission
): boolean {
  return hasPermission(user.role, permission);
}

/**
 * Get country filter for database queries
 * - Admin: no filter (returns undefined)
 * - Manager/Member: filter by their country
 */
export function getCountryFilter(
  user: UserWithoutPassword
): { country: Country } | {} {
  if (user.role === 'admin') {
    return {};
  }
  return { country: user.country };
}

/**
 * Check if user can cancel a specific order
 * Must have cancel_order permission AND order must be in their country scope
 */
export function canCancelOrder(
  user: UserWithoutPassword,
  orderCountry: Country
): boolean {
  const hasPermissionToCancel = hasPermission(user.role, 'cancel_order');
  const canAccessOrderCountry = canAccessCountry(user, orderCountry);
  return hasPermissionToCancel && canAccessOrderCountry;
}
