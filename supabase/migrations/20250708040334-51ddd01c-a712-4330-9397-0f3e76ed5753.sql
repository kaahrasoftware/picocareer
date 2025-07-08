-- Phase 1A: Add organization-specific user roles to user_type enum
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'organization_admin';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'organization_developer';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'organization_viewer';