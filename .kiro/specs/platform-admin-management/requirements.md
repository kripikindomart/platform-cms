# Requirements Document

## Introduction

The Platform Admin Management system provides super administrators with centralized control over all tenants in the multi-tenant CMS platform. This system enables cross-tenant visibility, user management across tenants, platform-wide monitoring, and configuration of global settings while maintaining strict tenant isolation principles.

## Glossary

- **Platform_Admin_System**: The administrative interface and backend services for managing all tenants
- **SuperAdmin**: A user with the SuperAdmin role that has cross-tenant access permissions
- **Tenant**: An isolated customer organization with its own schema (tenant_xxx) in the database
- **Platform_Admin_Tenant**: A special tenant with a random 26-character alphanumeric slug (like Supabase org IDs) that hosts the super administration portal
- **User_Tenant_Mapping**: The relationship table (public.tenant_user_mapping) connecting users to tenants
- **Tenant_Registry**: The public.tenants table containing all tenant configurations
- **Audit_Service**: The service responsible for logging all platform administrative actions
- **Tenant_Schema**: The isolated PostgreSQL schema (tenant_xxx) containing tenant-specific data
- **Public_Schema**: The shared PostgreSQL schema containing users, tenants, and cross-tenant data
- **Cross_Tenant_Permission**: A permission that allows access to data across multiple tenant schemas
- **Tenant_Statistics**: Aggregated metrics about a tenant (user count, data volume, activity)
- **Platform_Settings**: Global configuration values that apply across all tenants
- **SuperAdmin_Role**: A system role in the platform admin tenant with cross-tenant permissions

## Requirements

### Requirement 1: Platform Admin Tenant Creation

**User Story:** As a platform operator, I want a dedicated platform_admin tenant, so that super administrators have a secure workspace isolated from regular tenants.

#### Acceptance Criteria

1. WHEN the Platform_Admin_System is initialized, THE Platform_Admin_System SHALL create a tenant_platform_admin schema
2. WHEN the tenant_platform_admin schema is created, THE Platform_Admin_System SHALL register platform_admin in the Tenant_Registry with is_platform_admin flag set to true and is_active flag set to true
3. IF platform_admin already exists in Tenant_Registry, THEN THE Platform_Admin_System SHALL skip creation without returning an error
4. WHEN the platform_admin tenant is registered, THE Platform_Admin_System SHALL create a SuperAdmin_Role in tenant_platform_admin schema with is_system flag set to true
5. WHEN the SuperAdmin_Role is created, THE Platform_Admin_System SHALL define Cross_Tenant_Permission entries for tenant:create, tenant:read, tenant:update, tenant:delete, user:assign_tenant, and settings:update
6. WHEN Cross_Tenant_Permission entries are created, THE Platform_Admin_System SHALL assign all Cross_Tenant_Permission entries to the SuperAdmin_Role
7. IF any step in platform_admin tenant creation fails, THEN THE Platform_Admin_System SHALL roll back all changes within a database transaction and return a descriptive error message indicating which step failed

### Requirement 2: SuperAdmin User Management

**User Story:** As a platform operator, I want to designate users as super administrators, so that authorized personnel can manage the entire platform.

#### Acceptance Criteria

1. WHEN an existing SuperAdmin designates a user as SuperAdmin, THE Platform_Admin_System SHALL create an entry in User_Tenant_Mapping linking the user to the platform admin tenant
2. WHEN an existing SuperAdmin designates a user as SuperAdmin, THE Platform_Admin_System SHALL assign the SuperAdmin_Role to the user in the platform admin tenant schema
3. WHEN a SuperAdmin logs in with X-Tenant-Slug header set to the platform admin tenant slug, THE Platform_Admin_System SHALL return an authentication token granting access to the platform admin portal
4. IF a user attempts a cross-tenant operation without SuperAdmin_Role membership, THEN THE Platform_Admin_System SHALL reject the request with an error message indicating insufficient permissions
5. IF a SuperAdmin logs in without X-Tenant-Slug header or with a slug that does not match a tenant with is_platform_admin flag, THEN THE Platform_Admin_System SHALL reject the authentication request with an error message requiring valid platform admin tenant slug
6. WHEN an existing SuperAdmin removes a user from SuperAdmin role, THE Platform_Admin_System SHALL revoke the User_Tenant_Mapping entry for the platform admin tenant
7. WHEN a user is removed from SuperAdmin role, THE Platform_Admin_System SHALL also remove the SuperAdmin_Role assignment from the platform admin tenant schema

### Requirement 3: Tenant Management Interface

**User Story:** As a SuperAdmin, I want to view and manage all tenants, so that I can oversee platform operations and tenant lifecycle.

#### Acceptance Criteria

1. WHEN a SuperAdmin accesses /org/{platform_admin_slug}/portal/tenants, THE Platform_Admin_System SHALL display all entries from Tenant_Registry with Tenant_Statistics
2. WHEN a SuperAdmin creates a new tenant, THE Platform_Admin_System SHALL create a new Tenant_Schema with the naming pattern tenant_{slug}
3. IF the tenant slug already exists in Tenant_Registry, THEN THE Platform_Admin_System SHALL reject the creation request with an error message indicating the slug is already in use
4. IF schema creation fails due to database error, THEN THE Platform_Admin_System SHALL roll back the transaction and return an error message indicating the failure reason
5. WHEN a SuperAdmin creates a new tenant, THE Platform_Admin_System SHALL initialize default roles and permissions in the new Tenant_Schema and return a success confirmation with the new tenant identifier
6. WHEN a SuperAdmin creates a new tenant, THE Platform_Admin_System SHALL populate required fields including slug, name, and is_active
7. WHEN a SuperAdmin disables a tenant, THE Platform_Admin_System SHALL set is_active flag to false in Tenant_Registry and prevent all authentication attempts for that tenant
8. WHEN a SuperAdmin edits tenant metadata, THE Platform_Admin_System SHALL update the editable fields (name, description, contact_email, billing_email, settings) in the Tenant_Registry record
9. THE Platform_Admin_System SHALL display Tenant_Statistics including user count, storage usage in bytes, and last activity date for each tenant

### Requirement 4: Cross-Tenant User Management

**User Story:** As a SuperAdmin, I want to manage user access across all tenants, so that I can assign or revoke tenant access for any user.

#### Acceptance Criteria

1. WHEN a SuperAdmin views user details, THE Platform_Admin_System SHALL display all User_Tenant_Mapping entries for that user across all tenants
2. WHEN a SuperAdmin assigns a user to a tenant, THE Platform_Admin_System SHALL create a User_Tenant_Mapping entry with the specified tenant and role
3. WHEN a SuperAdmin removes a user from a tenant, THE Platform_Admin_System SHALL delete the corresponding User_Tenant_Mapping entry
4. IF a SuperAdmin attempts to assign a user to a tenant that does not exist in Tenant_Registry, THEN THE Platform_Admin_System SHALL reject the request with an error message indicating the tenant was not found
5. IF a SuperAdmin attempts to assign a role that does not exist in the target Tenant_Schema, THEN THE Platform_Admin_System SHALL reject the request with an error message indicating the role was not found
6. WHEN a SuperAdmin searches for users, THE Platform_Admin_System SHALL query Public_Schema users table and return results with tenant membership information
7. IF User_Tenant_Mapping creation fails due to database error, THEN THE Platform_Admin_System SHALL roll back the transaction and return an error message
8. IF User_Tenant_Mapping deletion fails due to database error, THEN THE Platform_Admin_System SHALL roll back the transaction and return an error message
9. WHEN a SuperAdmin views user details, THE Platform_Admin_System SHALL include role names and tenant names for each User_Tenant_Mapping entry

### Requirement 5: Cross-Tenant Dashboard

**User Story:** As a SuperAdmin, I want to see platform-wide statistics and monitoring, so that I can understand platform health and usage patterns.

#### Acceptance Criteria

1. WHEN a SuperAdmin accesses /org/{platform_admin_slug}/portal/dashboard, THE Platform_Admin_System SHALL display total tenant count from Tenant_Registry within 5 seconds
2. WHEN a SuperAdmin accesses the dashboard, THE Platform_Admin_System SHALL display total user count from Public_Schema users table within 5 seconds
3. WHEN a SuperAdmin accesses the dashboard, THE Platform_Admin_System SHALL display active tenant count where is_active is true within 5 seconds
4. WHEN a SuperAdmin accesses the dashboard, THE Platform_Admin_System SHALL aggregate and display total User_Tenant_Mapping entries across all tenants within 10 seconds
5. WHEN a SuperAdmin accesses the dashboard, THE Platform_Admin_System SHALL display the most recent 50 platform activities from Audit_Service logs created within the last 7 days
6. WHEN a SuperAdmin accesses the dashboard, THE Platform_Admin_System SHALL calculate and display platform-wide storage usage in bytes by querying each Tenant_Schema within 30 seconds
7. IF any dashboard metric query fails, THEN THE Platform_Admin_System SHALL display an error indicator for that metric and continue loading remaining metrics

### Requirement 6: Tenant Switching for Deep-Dive Management

**User Story:** As a SuperAdmin, I want to quickly switch to any tenant context, so that I can perform deep-dive troubleshooting and management within that tenant.

#### Acceptance Criteria

1. IF a SuperAdmin selects a tenant that does not exist in Tenant_Registry or has is_active set to false, THEN THE Platform_Admin_System SHALL reject the switch request with an error message indicating the tenant is unavailable
2. WHEN a SuperAdmin selects a tenant from the tenant list, THE Platform_Admin_System SHALL create a temporary User_Tenant_Mapping entry with an admin role for that tenant and marked with "superadmin_switch" distinguishing flag
3. IF User_Tenant_Mapping creation fails, THEN THE Platform_Admin_System SHALL reject the switch request with an error message and prevent tenant context change
4. IF the default admin role does not exist in the target Tenant_Schema, THEN THE Platform_Admin_System SHALL validate the available roles and assign the highest privilege role
5. WHEN a SuperAdmin switches to a tenant, THE Platform_Admin_System SHALL redirect to /org/{tenant_slug}/portal with the X-Tenant-Slug header set to the target tenant slug and context_type marker set to "superadmin_switch"
6. WHILE a SuperAdmin is operating within a switched tenant, THE Platform_Admin_System SHALL maintain search_path set to the target Tenant_Schema
7. WHEN a SuperAdmin exits tenant context, THE Platform_Admin_System SHALL remove the temporary User_Tenant_Mapping entry where the distinguishing flag is "superadmin_switch"
8. WHEN a SuperAdmin switches to a tenant, THE Platform_Admin_System SHALL set a session attribute "superadmin_origin_tenant" with the platform admin tenant slug to enable easy return
9. WHEN a SuperAdmin returns to platform admin portal, THE Platform_Admin_System SHALL restore search_path to the platform admin tenant schema

### Requirement 7: Platform Settings Management

**User Story:** As a SuperAdmin, I want to configure platform-wide settings, so that I can control global behavior and defaults for all tenants.

#### Acceptance Criteria

1. THE Platform_Admin_System SHALL store Platform_Settings in Public_Schema system_settings table with scope set to "platform"
2. WHEN a SuperAdmin updates a Platform_Settings value, THE Platform_Admin_System SHALL validate the setting key exists in the allowed settings schema before persisting
3. IF a Platform_Settings key does not exist in the settings schema, THEN THE Platform_Admin_System SHALL reject the update request with an error message indicating the key is invalid
4. WHEN a Platform_Settings value passes validation, THE Platform_Admin_System SHALL persist the change to Public_Schema system_settings table and return a success confirmation
5. THE Platform_Admin_System SHALL support Platform_Settings for default_tenant_quota_users (integer), default_tenant_quota_storage_gb (integer), auth_session_timeout_minutes (integer), auth_require_email_verification (boolean), and feature_flags (JSON object)
6. WHEN any tenant accesses a feature controlled by Platform_Settings, THE Platform_Admin_System SHALL retrieve the global setting value from Public_Schema system_settings where scope is "platform", and if a tenant-specific override exists where scope is "tenant", apply the tenant-specific value instead
7. WHEN a SuperAdmin updates a Platform_Settings value, THE Platform_Admin_System SHALL create a history record in Audit_Service containing the setting key, previous value, new value, timestamp, and SuperAdmin user ID
8. IF history creation in Audit_Service fails, THEN THE Platform_Admin_System SHALL proceed with the settings update and log the audit failure locally
9. WHEN Platform_Settings are retrieved, THE Platform_Admin_System SHALL return the setting value within 1 second

### Requirement 8: Audit Logging for Platform Operations

**User Story:** As a platform operator, I want comprehensive audit logs of all platform admin actions, so that I can track changes and investigate security incidents.

#### Acceptance Criteria

1. WHEN a SuperAdmin performs a tenant management operation (create, update, disable, delete, or view_all), THE Audit_Service SHALL create an audit log entry in the platform admin tenant schema with user_id, tenant_id, action, timestamp in ISO 8601 format, and request metadata
2. IF audit log creation fails, THEN THE Audit_Service SHALL log the failure locally without blocking the tenant management operation
3. WHEN a SuperAdmin modifies User_Tenant_Mapping, THE Audit_Service SHALL log the affected user_id, tenant_id, previous role, and new role in the platform admin tenant schema
4. WHEN a SuperAdmin updates Platform_Settings, THE Audit_Service SHALL log the setting key, old value, and new value in the platform admin tenant schema
5. WHEN a SuperAdmin switches tenant context, THE Audit_Service SHALL log the source tenant, target tenant, and switch timestamp in ISO 8601 format in the platform admin tenant schema
6. THE Audit_Service SHALL store platform admin audit logs in the platform admin tenant schema with is_platform_audit flag set to true and retention period of 365 days
7. THE Platform_Admin_System SHALL provide an audit log viewer at /org/{platform_admin_slug}/portal/audit that displays all platform administrative actions with filtering by date range, user, action type, and tenant
8. WHEN a SuperAdmin attempts a tenant management operation without authorization, THE Audit_Service SHALL log the failed authorization attempt with user_id, attempted action, and timestamp
9. WHEN a user fails authentication to the platform admin portal, THE Audit_Service SHALL log the failed attempt with email, source IP address, and timestamp
10. WHEN audit logs exceed the 365-day retention period, THE Audit_Service SHALL archive expired logs to cold storage and remove them from the active platform admin tenant schema

### Requirement 9: Tenant Isolation Protection

**User Story:** As a platform operator, I want platform admin operations to maintain tenant isolation, so that no data leakage occurs between tenants.

#### Acceptance Criteria

1. WHEN the Platform_Admin_System queries Tenant_Statistics, THE Platform_Admin_System SHALL execute separate queries with search_path set to each Tenant_Schema individually with a timeout of 30 seconds per query
2. WHEN the Platform_Admin_System completes any cross-tenant query operation, THE Platform_Admin_System SHALL reset search_path to the platform admin tenant schema within 100 milliseconds
3. WHEN displaying tenant data in aggregate views, THE Platform_Admin_System SHALL NOT join data from multiple Tenant_Schema in a single query
4. IF a user attempts any operation that reads from multiple Tenant_Schema without SuperAdmin_Role, THEN THE Platform_Admin_System SHALL reject the operation and return an error message indicating insufficient permissions
5. WHEN an error occurs during cross-tenant operations, THE Platform_Admin_System SHALL log the error including the affected tenant slug and continue processing remaining tenants without exposing data from the failed tenant or other tenants
6. THE Platform_Admin_System SHALL implement rate limiting on cross-tenant queries allowing a maximum of 10 operations per 60 seconds per SuperAdmin user to prevent resource exhaustion
7. IF rate limit is exceeded, THEN THE Platform_Admin_System SHALL reject further cross-tenant operations until the time window resets and return an error message indicating the rate limit was exceeded
8. WHEN the Platform_Admin_System sets search_path to a Tenant_Schema, THE Platform_Admin_System SHALL validate the schema name matches the pattern ^tenant_[a-z0-9][a-z0-9_-]*[a-z0-9]$ before execution

### Requirement 10: Platform Admin Portal Access Control

**User Story:** As a security administrator, I want strict access control for the platform admin portal, so that only authorized super administrators can access it.

#### Acceptance Criteria

1. WHEN a user attempts to access /org/{platform_admin_slug}/portal, THE Platform_Admin_System SHALL verify the tenant slug has is_platform_admin flag set to true and the user has SuperAdmin_Role in that tenant schema, and grant access if verified
2. IF a user without SuperAdmin_Role attempts to access the platform admin portal, THEN THE Platform_Admin_System SHALL deny access and return an error message indicating insufficient permissions
3. IF a user with SuperAdmin_Role has X-Tenant-Slug header set to a value that does not match a tenant with is_platform_admin flag, THEN THE Platform_Admin_System SHALL deny access and return an error message indicating tenant mismatch
4. WHEN a SuperAdmin attempts to access the platform admin portal, THE Platform_Admin_System SHALL require completion of multi-factor authentication within 5 minutes before granting access
5. IF multi-factor authentication fails or times out, THEN THE Platform_Admin_System SHALL deny access and return an error message indicating authentication failure
6. WHILE a SuperAdmin session has no HTTP requests for 30 consecutive minutes, THE Platform_Admin_System SHALL automatically terminate the session
7. IF a SuperAdmin attempts to access the platform admin portal with an expired session, THEN THE Platform_Admin_System SHALL deny access and return an error message indicating session expiration
8. WHEN a SuperAdmin session expires or is terminated, THE Platform_Admin_System SHALL clear all tenant context including search_path and session attributes

### Requirement 11: Tenant Statistics Aggregation

**User Story:** As a SuperAdmin, I want accurate tenant statistics, so that I can make informed decisions about resource allocation and tenant management.

#### Acceptance Criteria

1. WHEN calculating Tenant_Statistics for a tenant, THE Platform_Admin_System SHALL query tables in the Tenant_Schema excluding system tables (roles, permissions, user_roles, role_permissions, sessions, audit_logs) and count all records where deleted_at IS NULL or deleted_at column does not exist
2. IF the query for record count exceeds 30 seconds, THEN THE Platform_Admin_System SHALL terminate the query and return an error indicating timeout
3. WHEN calculating user count for a tenant, THE Platform_Admin_System SHALL count User_Tenant_Mapping entries in Public_Schema where tenant_id matches the target tenant
4. WHEN calculating storage usage for a tenant, THE Platform_Admin_System SHALL query PostgreSQL pg_total_relation_size for all tables in the Tenant_Schema and return the sum in bytes
5. IF storage usage calculation exceeds 60 seconds, THEN THE Platform_Admin_System SHALL terminate the query and return an error indicating timeout
6. WHEN Tenant_Statistics are calculated, THE Platform_Admin_System SHALL cache the results for 5 minutes with cache key pattern "tenant_stats:{tenant_id}"
7. WHEN a SuperAdmin requests fresh statistics with refresh parameter set to true, THE Platform_Admin_System SHALL bypass cache and recalculate Tenant_Statistics within 120 seconds
8. WHEN calculating last activity date for a tenant, THE Platform_Admin_System SHALL query all tables in Tenant_Schema for the maximum value of created_at or updated_at columns where such columns exist
9. IF no activity timestamps are found in a Tenant_Schema, THEN THE Platform_Admin_System SHALL return null for last activity date
10. IF any statistics calculation fails, THEN THE Platform_Admin_System SHALL return partial statistics with null values for failed metrics and an error indicator

### Requirement 12: Tenant Creation Workflow

**User Story:** As a SuperAdmin, I want a streamlined tenant creation workflow, so that I can quickly onboard new customers.

#### Acceptance Criteria

1. WHEN a SuperAdmin initiates tenant creation, THE Platform_Admin_System SHALL validate the tenant slug follows the pattern ^[a-z0-9][a-z0-9_-]*[a-z0-9]$ and has a length between 3 and 63 characters
2. IF the tenant slug fails validation, THEN THE Platform_Admin_System SHALL reject the request and return an error message indicating the validation failure reason
3. WHEN a SuperAdmin initiates tenant creation, THE Platform_Admin_System SHALL verify the tenant slug is unique in Tenant_Registry
4. IF the tenant slug already exists in Tenant_Registry, THEN THE Platform_Admin_System SHALL reject the request and return an error message indicating the slug is already in use
5. WHEN creating a tenant, THE Platform_Admin_System SHALL execute CREATE SCHEMA "tenant_{slug}" in a database transaction with a timeout of 30 seconds
6. WHEN creating a tenant, THE Platform_Admin_System SHALL execute tenant initialization migrations that create the tables users, roles, permissions, role_permissions, and user_roles in the new Tenant_Schema
7. WHEN creating a tenant, THE Platform_Admin_System SHALL insert default roles (admin, editor, viewer) and their associated permissions (create_content, edit_content, view_content, delete_content, manage_users, manage_roles) into the new Tenant_Schema
8. IF any step in tenant creation fails, THEN THE Platform_Admin_System SHALL roll back the entire transaction and return an error message indicating which step failed and the failure reason
9. WHEN tenant creation succeeds, THE Platform_Admin_System SHALL log the creation event to Audit_Service
10. IF logging to Audit_Service fails, THEN THE Platform_Admin_System SHALL proceed with tenant creation and log the audit failure locally
11. WHEN tenant creation succeeds, THE Platform_Admin_System SHALL send a notification to the SuperAdmin indicating successful tenant creation

### Requirement 13: User Search and Filtering

**User Story:** As a SuperAdmin, I want advanced user search and filtering capabilities, so that I can quickly find users across all tenants.

#### Acceptance Criteria

1. WHEN a SuperAdmin searches for users by email, THE Platform_Admin_System SHALL return all users whose email contains the search term regardless of case
2. WHEN a SuperAdmin filters users by tenant, THE Platform_Admin_System SHALL return only users belonging to the specified tenant
3. WHEN a SuperAdmin filters users by role, THE Platform_Admin_System SHALL return all users assigned the specified role across all tenants
4. WHEN a SuperAdmin applies multiple filters simultaneously, THE Platform_Admin_System SHALL return only users matching all specified filter criteria
5. WHEN a SuperAdmin requests paginated user search results, THE Platform_Admin_System SHALL return results with page size between 10 and 100 records, defaulting to 25 records per page
6. WHEN a SuperAdmin performs a user search, THE Platform_Admin_System SHALL return results sorted by email in ascending order by default
7. IF a user search returns no matching users, THEN THE Platform_Admin_System SHALL return an empty result set with a message indicating no users found
8. IF a SuperAdmin provides an invalid tenant identifier, THEN THE Platform_Admin_System SHALL reject the filter request with an error message indicating the tenant does not exist
9. IF a SuperAdmin provides an invalid role name, THEN THE Platform_Admin_System SHALL reject the filter request with an error message indicating the role does not exist
10. WHEN a SuperAdmin exports user search results, THE Platform_Admin_System SHALL generate a CSV file containing email, full name, status, assigned roles, and tenant memberships for each user

### Requirement 14: Tenant Monitoring and Health Checks

**User Story:** As a SuperAdmin, I want real-time tenant health monitoring, so that I can proactively identify and resolve issues.

#### Acceptance Criteria

1. THE Platform_Admin_System SHALL perform health checks on all tenants where is_active is true in Tenant_Registry every 5 minutes
2. WHEN performing a health check, THE Platform_Admin_System SHALL verify the Tenant_Schema exists in the database
3. WHEN performing a health check, THE Platform_Admin_System SHALL execute a SELECT 1 query with search_path set to the Tenant_Schema with a timeout of 10 seconds
4. IF a health check query times out or returns an error, THEN THE Platform_Admin_System SHALL mark the health check as failed
5. IF a health check fails for a tenant, THEN THE Platform_Admin_System SHALL log an error to Audit_Service and update the tenant status to "unhealthy" in Tenant_Registry
6. IF a tenant has 3 consecutive failed health checks, THEN THE Platform_Admin_System SHALL update the tenant status to "degraded" in Tenant_Registry
7. WHEN a tenant status changes to unhealthy or degraded, THE Platform_Admin_System SHALL send an alert notification to all SuperAdmin users
8. IF notification delivery fails, THEN THE Platform_Admin_System SHALL log the failure and continue health check processing

### Requirement 15: Platform Settings Schema and Validation

**User Story:** As a platform operator, I want structured validation for platform settings, so that invalid configurations cannot be applied.

#### Acceptance Criteria

1. THE Platform_Admin_System SHALL define a settings schema with allowed keys, value types, default values, and validation rules including minimum and maximum bounds for numeric and string types
2. WHEN a SuperAdmin attempts to update a Platform_Settings value, THE Platform_Admin_System SHALL validate the value against the settings schema before persisting the change
3. IF a Platform_Settings key does not exist in the settings schema, THEN THE Platform_Admin_System SHALL reject the update and return an error message indicating the key is not recognized
4. IF a Platform_Settings value fails schema validation, THEN THE Platform_Admin_System SHALL reject the update and return an error message indicating the validation rule that failed and the submitted value
5. IF a Platform_Settings value passes validation, THEN THE Platform_Admin_System SHALL persist the updated value and return a success confirmation
6. THE Platform_Admin_System SHALL support Platform_Settings value types of string with maximum length of 10,000 characters, number with range -999,999,999.99 to 999,999,999.99, boolean, and JSON object with maximum nesting depth of 10 levels and maximum serialized size of 100,000 characters
7. WHEN a Platform_Settings key is retrieved, THE Platform_Admin_System SHALL return the explicitly configured value if present, otherwise the default value from the settings schema
8. WHEN a deprecated Platform_Settings key is accessed, THE Platform_Admin_System SHALL log a warning message identifying the deprecated key name and continue to return the value

