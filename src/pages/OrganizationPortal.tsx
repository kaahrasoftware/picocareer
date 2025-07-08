import React from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { OrganizationDashboard } from '@/components/organization/OrganizationDashboard';
import { OrganizationAuth } from '@/components/organization/OrganizationAuth';
import { useOrganizationAuth } from '@/hooks/useOrganizationAuth';

export default function OrganizationPortal() {
  const { isAuthenticated } = useAuthSession('optional');
  const { organization, loading, error } = useOrganizationAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <OrganizationAuth />;
  }

  if (error || !organization) {
    return <OrganizationAuth error={error} />;
  }

  return <OrganizationDashboard organization={organization} />;
}