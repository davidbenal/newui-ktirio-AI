// User roles as both type and enum
export type UserRole = 'admin' | 'support' | 'user' | 'owner' | 'collaborator';

export const UserRole = {
  OWNER: 'owner' as const,
  ADMIN: 'admin' as const,
  COLLABORATOR: 'collaborator' as const,
  SUPPORT: 'support' as const,
  USER: 'user' as const,
};

// Admin user interface
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'trial' | 'professional' | 'business';
  credits: number;
  createdAt: Date;
  lastAccess: Date;
  status: 'active' | 'trial' | 'suspended' | 'inactive';
  totalImagesGenerated: number;
  totalCreditsUsed: number;
}

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'trial_extension';
  value: number;
  maxUses: number; // -1 for unlimited
  currentUses: number;
  validUntil: Date;
  isActive: boolean;
  applicablePlans: string[];
  createdBy: string;
  createdAt: Date;
}

// Trial link interface
export interface TrialLink {
  id: string;
  linkId: string;
  name: string;
  trialDays: number;
  initialCredits: number;
  maxUses: number; // -1 for unlimited
  currentUses: number;
  isActive: boolean;
  utmParams: {
    source: string;
    medium: string;
    campaign: string;
  };
  createdBy: string;
  createdAt: Date;
  conversions: number;
}

// User permissions interface
export interface UserPermissions {
  userId: string;
  email: string;
  role: UserRole | string;
  grantedBy: string;
  grantedAt: Date;
}

// Permission check functions
export function canViewFinancials(role: UserRole | string): boolean {
  return role === 'admin' || role === 'owner';
}

export function canManageUsers(role: UserRole | string): boolean {
  return role === 'admin' || role === 'support' || role === 'owner';
}

export function canManageCoupons(role: UserRole | string): boolean {
  return role === 'admin' || role === 'owner';
}

export function canManageAdmins(role: UserRole | string): boolean {
  return role === 'owner' || role === 'admin';
}

export function canDeleteUsers(role: UserRole | string): boolean {
  return role === 'owner' || role === 'admin';
}

export function canEditCoupons(role: UserRole | string): boolean {
  return role === 'admin' || role === 'owner';
}

export function isAdmin(role: UserRole | string): boolean {
  return role === 'admin' || role === 'owner';
}
