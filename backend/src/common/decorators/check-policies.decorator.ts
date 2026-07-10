import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '@/core/casl/casl-ability.factory';

export const CHECK_POLICIES_KEY = 'check_policy';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandler = ((ability: AppAbility) => boolean) | IPolicyHandler;

/**
 * Decorator untuk check CASL policies
 * 
 * @example
 * ```typescript
 * @CheckPolicies((ability: AppAbility) => ability.can('read', 'users'))
 * async findAll() {
 *   // Only users with users.read permission can access
 * }
 * 
 * @CheckPolicies(
 *   (ability: AppAbility) => ability.can('create', 'users'),
 *   (ability: AppAbility) => ability.can('manage', 'roles')
 * )
 * async createWithRole() {
 *   // Requires both users.create AND roles.manage permissions
 * }
 * ```
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) => SetMetadata(CHECK_POLICIES_KEY, handlers);
