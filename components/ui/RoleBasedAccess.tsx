'use client';

import React from 'react';

interface User {
  id: string;
  personType?: string;
  isAdmin?: boolean;
  isSuperadmin?: boolean;
}

interface RoleBasedAccessProps {
  user: User | null;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  requireSuperadmin?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  user,
  allowedRoles = [],
  requireAdmin = false,
  requireSuperadmin = false,
  children,
  fallback = null,
}) => {
  if (!user) {
    return fallback;
  }

  const userRole = user.personType || 'coach';
  const isSuperadmin = userRole === 'superadmin' || user.isSuperadmin;
  const isAdmin = userRole === 'admin' || user.isAdmin || isSuperadmin;

  // Check superadmin requirement
  if (requireSuperadmin && !isSuperadmin) {
    return fallback;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return fallback;
  }

  // Check specific role requirements
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return fallback;
  }

  return <>{children}</>;
};

// Convenience components for common role checks
export const AdminOnly: React.FC<
  Omit<RoleBasedAccessProps, 'requireAdmin'>
> = props => <RoleBasedAccess {...props} requireAdmin={true} />;

export const SuperadminOnly: React.FC<
  Omit<RoleBasedAccessProps, 'requireSuperadmin'>
> = props => <RoleBasedAccess {...props} requireSuperadmin={true} />;

export const CoachOnly: React.FC<
  Omit<RoleBasedAccessProps, 'allowedRoles'>
> = props => <RoleBasedAccess {...props} allowedRoles={['coach']} />;

export const PlayerOnly: React.FC<
  Omit<RoleBasedAccessProps, 'allowedRoles'>
> = props => <RoleBasedAccess {...props} allowedRoles={['player']} />;

export const NonPlayerOnly: React.FC<RoleBasedAccessProps> = ({
  user,
  children,
  fallback,
}) => {
  if (!user) {
    return fallback;
  }

  const userRole = user.personType || 'coach';
  if (userRole === 'player') {
    return fallback;
  }

  return <>{children}</>;
};
