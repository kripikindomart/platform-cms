import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant.interface';

/**
 * Current Tenant Decorator
 *
 * Inject tenant context ke controller method parameter
 *
 * Usage:
 * ```typescript
 * @Get()
 * async findAll(@CurrentTenant() tenant: TenantContext) {
 *   console.log(`Tenant: ${tenant.name}`);
 *   return this.service.findAll();
 * }
 * ```
 *
 * Note: Tenant harus sudah di-set dalam request object (req.tenant)
 * oleh middleware atau guard
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new Error(
        'Tenant not found in request. ' +
          'Make sure tenant middleware is applied to this route.',
      );
    }

    return tenant;
  },
);
