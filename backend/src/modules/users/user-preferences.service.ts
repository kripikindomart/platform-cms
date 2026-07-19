import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../database/schema/public';

export interface UserPreferenceDto {
  is_single_tenant_mode?: boolean;
  default_tenant_id?: number | null;
  skip_org_selection?: boolean;
  show_org_switcher?: boolean;
  theme?: string;
  language?: string;
  timezone?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  notification_settings?: any;
  additional_settings?: any;
}

@Injectable()
export class UserPreferencesService {
  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get user preferences
   */
  async getPreferences(userId: number) {
    const [preferences] = await this.db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.user_id, userId))
      .limit(1);

    if (!preferences) {
      // Create default preferences if not exists
      return this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  /**
   * Create default preferences for new user
   */
  async createDefaultPreferences(userId: number) {
    const [preferences] = await this.db
      .insert(schema.userPreferences)
      .values({
        user_id: userId,
        is_single_tenant_mode: false,
        skip_org_selection: false,
        show_org_switcher: true,
        theme: 'light',
        language: 'id',
        timezone: 'Asia/Jakarta',
        email_notifications: true,
        push_notifications: true,
      })
      .returning();

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: number, dto: UserPreferenceDto) {
    // Check if preferences exist
    const existing = await this.getPreferences(userId);

    if (!existing) {
      throw new NotFoundException('User preferences not found');
    }

    const [updated] = await this.db
      .update(schema.userPreferences)
      .set({
        ...dto,
        updated_at: new Date(),
      })
      .where(eq(schema.userPreferences.user_id, userId))
      .returning();

    return updated;
  }

  /**
   * Enable single tenant mode for user
   */
  async enableSingleTenantMode(
    userId: number,
    defaultTenantId: number,
    skipOrgSelection = true,
  ) {
    return this.updatePreferences(userId, {
      is_single_tenant_mode: true,
      default_tenant_id: defaultTenantId,
      skip_org_selection: skipOrgSelection,
      show_org_switcher: false,
    });
  }

  /**
   * Disable single tenant mode for user
   */
  async disableSingleTenantMode(userId: number) {
    return this.updatePreferences(userId, {
      is_single_tenant_mode: false,
      default_tenant_id: null,
      skip_org_selection: false,
      show_org_switcher: true,
    });
  }

  /**
   * Get user's default tenant for auto-redirect
   */
  async getDefaultTenant(userId: number): Promise<{
    shouldAutoRedirect: boolean;
    tenantId: number | null;
    tenantSlug: string | null;
  }> {
    const preferences = await this.getPreferences(userId);

    if (
      !preferences.is_single_tenant_mode ||
      !preferences.default_tenant_id
    ) {
      return {
        shouldAutoRedirect: false,
        tenantId: null,
        tenantSlug: null,
      };
    }

    // Get tenant details
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, preferences.default_tenant_id))
      .limit(1);

    if (!tenant || !tenant.is_active) {
      return {
        shouldAutoRedirect: false,
        tenantId: null,
        tenantSlug: null,
      };
    }

    return {
      shouldAutoRedirect: preferences.skip_org_selection,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };
  }
}
