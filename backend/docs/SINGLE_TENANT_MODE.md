# Single Tenant Mode & User Preferences

## Overview

Single Tenant Mode allows users to bypass the organization selection page and automatically redirect to their assigned tenant upon login. This is useful for:

- **Dedicated Users**: Users who only work with one specific tenant
- **Client Portals**: External users who should only access their organization
- **Simplified UX**: Reduce friction for single-organization users

## Database Schema

### `public.user_preferences` Table

```sql
CREATE TABLE public.user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Single Tenant Mode Settings
    is_single_tenant_mode BOOLEAN NOT NULL DEFAULT false,
    default_tenant_id BIGINT REFERENCES public.tenants(id) ON DELETE SET NULL,
    skip_org_selection BOOLEAN NOT NULL DEFAULT false,
    show_org_switcher BOOLEAN NOT NULL DEFAULT true,
    
    -- UI/UX Preferences
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Notification Preferences
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    notification_settings JSONB,
    
    -- Additional Settings
    additional_settings JSONB,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);
```

### Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| `is_single_tenant_mode` | boolean | Enable/disable single tenant mode |
| `default_tenant_id` | bigint | The tenant to auto-redirect to |
| `skip_org_selection` | boolean | If true, bypass `/organizations` page |
| `show_org_switcher` | boolean | If false, hide tenant switcher in header |
| `theme` | varchar | UI theme: 'light', 'dark', 'auto' |
| `language` | varchar | Preferred language: 'id', 'en' |
| `timezone` | varchar | User timezone |

### Tenant Config

Tenant-level settings stored in `public.tenants.config` (JSONB):

```json
{
  "allow_org_switching": true,
  "force_single_tenant_mode": false,
  "branding": {
    "primary_color": "#3B82F6",
    "logo_url": null
  },
  "security": {
    "session_timeout": 86400,
    "require_2fa": false,
    "allowed_ip_ranges": null
  },
  "features": {
    "enable_api_access": true,
    "enable_webhooks": false,
    "enable_audit_logs": true
  }
}
```

## Backend API

### 1. Get User Preferences

```http
GET /api/users/preferences
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 10,
  "is_single_tenant_mode": true,
  "default_tenant_id": 2,
  "skip_org_selection": true,
  "show_org_switcher": false,
  "theme": "light",
  "language": "id",
  "timezone": "Asia/Jakarta",
  "email_notifications": true,
  "push_notifications": true,
  "created_at": "2026-07-18T10:00:00.000Z",
  "updated_at": "2026-07-18T10:00:00.000Z"
}
```

### 2. Update User Preferences

```http
PUT /api/users/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_single_tenant_mode": true,
  "default_tenant_id": 2,
  "skip_org_selection": true,
  "show_org_switcher": false
}
```

### 3. Login Response (Enhanced)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 10,
    "email": "user@example.com",
    "name": "John Doe",
    "is_verified": true
  },
  "redirect": {
    "shouldAutoRedirect": true,
    "tenantId": 2,
    "tenantSlug": "9the1kyfo0waz62w01w6l7u543"
  }
}
```

## Frontend Implementation

### 1. Login Flow with Auto-Redirect

```typescript
// app/(auth)/login/page.tsx
const onSubmit = async (data: LoginFormData) => {
  const response = await authService.login(data);
  
  // Check for auto-redirect
  if (response.redirect?.shouldAutoRedirect && response.redirect.tenantSlug) {
    router.push(`/org/${response.redirect.tenantSlug}/portal`);
  } else {
    router.push('/organizations');
  }
};
```

### 2. Conditional Tenant Switcher

```typescript
// components/layout/header.tsx
const [preferences, setPreferences] = useState<UserPreferences | null>(null);

useEffect(() => {
  loadPreferences();
}, []);

const loadPreferences = async () => {
  const prefs = await userPreferencesService.getPreferences();
  setPreferences(prefs);
};

// Only show tenant switcher if enabled in preferences
{preferences?.show_org_switcher && (
  <TenantSwitcherDropdown />
)}
```

### 3. User Preferences Service

```typescript
// lib/api/services/user-preferences.service.ts
export const userPreferencesService = {
  async enableSingleTenantMode(defaultTenantId: number) {
    return this.updatePreferences({
      is_single_tenant_mode: true,
      default_tenant_id: defaultTenantId,
      skip_org_selection: true,
      show_org_switcher: false,
    });
  },
  
  async disableSingleTenantMode() {
    return this.updatePreferences({
      is_single_tenant_mode: false,
      default_tenant_id: null,
      skip_org_selection: false,
      show_org_switcher: true,
    });
  },
};
```

## Usage Examples

### Example 1: Enable Single Tenant Mode for User

```typescript
// Enable single tenant mode for user ID 10
const preferences = await userPreferencesService.enableSingleTenantMode(userId, tenantId);

console.log(preferences);
// {
//   is_single_tenant_mode: true,
//   default_tenant_id: 2,
//   skip_org_selection: true,
//   show_org_switcher: false
// }
```

### Example 2: SQL Query to Set Single Tenant Mode

```sql
-- Enable single tenant mode for specific user
UPDATE public.user_preferences
SET 
    is_single_tenant_mode = true,
    default_tenant_id = 2,
    skip_org_selection = true,
    show_org_switcher = false,
    updated_at = NOW()
WHERE user_id = 10;
```

### Example 3: Bulk Enable for All Users in a Tenant

```sql
-- Enable single tenant mode for all users who only have access to one tenant
WITH single_tenant_users AS (
    SELECT 
        u.id as user_id,
        MIN(ur.tenant_id) as tenant_id
    FROM public.users u
    JOIN tenant_xxx.user_roles ur ON u.id = ur.user_id
    GROUP BY u.id
    HAVING COUNT(DISTINCT ur.tenant_id) = 1
)
UPDATE public.user_preferences up
SET 
    is_single_tenant_mode = true,
    default_tenant_id = stu.tenant_id,
    skip_org_selection = true,
    show_org_switcher = false,
    updated_at = NOW()
FROM single_tenant_users stu
WHERE up.user_id = stu.user_id;
```

## User Experience Flows

### Flow 1: Multi-Tenant User (Default)

```
1. User logs in
2. Redirected to /organizations
3. User selects a tenant
4. Redirected to /org/{slug}/portal
5. Tenant switcher visible in header
```

### Flow 2: Single-Tenant User

```
1. User logs in
2. Automatically redirected to /org/{slug}/portal
3. No organization selection page
4. Tenant switcher hidden in header
5. Simplified, dedicated experience
```

### Flow 3: Administrator Managing User Preferences

```
1. Admin accesses user management
2. Views user's current preferences
3. Toggles "Single Tenant Mode"
4. Selects default tenant
5. User's next login auto-redirects
```

## Security Considerations

1. **Tenant Access Validation**: Always validate user has access to `default_tenant_id`
2. **Tenant Switching**: Disabled for single-tenant users via UI, but validate on backend
3. **Role-Based**: Consider restricting single-tenant mode based on user roles
4. **Audit Logging**: Log preference changes for compliance

## Migration Scripts

### Run Migrations

```bash
# Create user_preferences table
psql -U postgres -d platform_cms -f migrations/create-user-preferences-table.sql

# Update tenant config
psql -U postgres -d platform_cms -f migrations/update-tenant-config-settings.sql
```

### Rollback

```sql
-- Rollback user_preferences table
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS update_user_preferences_updated_at();
DROP TABLE IF EXISTS public.user_preferences CASCADE;
```

## Testing

### Test Single Tenant Mode

```bash
# 1. Create test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# 2. Enable single tenant mode
curl -X PUT http://localhost:3000/api/users/preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "is_single_tenant_mode": true,
    "default_tenant_id": 2,
    "skip_org_selection": true,
    "show_org_switcher": false
  }'

# 3. Login and verify auto-redirect
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
  
# Response should include:
# "redirect": {
#   "shouldAutoRedirect": true,
#   "tenantId": 2,
#   "tenantSlug": "xxx"
# }
```

## Future Enhancements

- [ ] Tenant-level force single-tenant mode
- [ ] Role-based auto-assignment of default tenant
- [ ] Admin UI for managing user preferences
- [ ] Bulk preference updates via CSV import
- [ ] Preference presets/templates
- [ ] Analytics on org switching behavior
