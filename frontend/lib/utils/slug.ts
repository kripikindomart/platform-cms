/**
 * Generate URL-friendly slug from string
 * 
 * @param text - Input string to convert to slug
 * @returns URL-friendly slug (lowercase, hyphenated)
 * 
 * @example
 * generateSlug("My Tenant Name") // "my-tenant-name"
 * generateSlug("Hello World!") // "hello-world"
 * generateSlug("  Acme Corp  ") // "acme-corp"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
