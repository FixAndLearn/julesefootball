/**
 * eFootballMarket Super Admin & Privilege Enforcement
 * Primary Super Administrator: brianokibo@gmail.com (Brian Okibo, Chief Executive Officer)
 */

export const PRIMARY_SUPER_ADMIN_EMAIL = "brianokibo@gmail.com";

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase();
}

export function isUserAdmin(userEmail?: string | null, role?: string | null): boolean {
  if (isSuperAdminEmail(userEmail)) return true;
  if (!role) return false;
  return role === "admin" || role === "super_admin";
}
