/**
 * Icon Mapper Utility
 * Maps icon name strings to Lucide Icon components
 */

import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/**
 * Get Lucide icon component by name
 * Falls back to Package icon if not found
 */
export function getIconByName(iconName?: string): LucideIcon {
  if (!iconName) {
    return LucideIcons.Package;
  }

  // Try to get icon from lucide-react
  const Icon = (LucideIcons as any)[iconName];
  
  if (Icon && typeof Icon === 'function') {
    return Icon as LucideIcon;
  }

  // Fallback to Package icon
  console.warn(`Icon "${iconName}" not found in lucide-react, using Package icon as fallback`);
  return LucideIcons.Package;
}

/**
 * Get icon component with fallback chain
 */
export function getIconWithFallback(
  iconName?: string,
  fallbackIconName?: string,
): LucideIcon {
  // Try primary icon
  if (iconName) {
    const Icon = (LucideIcons as any)[iconName];
    if (Icon && typeof Icon === 'function') {
      return Icon as LucideIcon;
    }
  }

  // Try fallback icon
  if (fallbackIconName) {
    const FallbackIcon = (LucideIcons as any)[fallbackIconName];
    if (FallbackIcon && typeof FallbackIcon === 'function') {
      return FallbackIcon as LucideIcon;
    }
  }

  // Final fallback
  return LucideIcons.Package;
}

/**
 * Validate if icon name exists in Lucide
 */
export function isValidIconName(iconName: string): boolean {
  const Icon = (LucideIcons as any)[iconName];
  return Icon && typeof Icon === 'function';
}
