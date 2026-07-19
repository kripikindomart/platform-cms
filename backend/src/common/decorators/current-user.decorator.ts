import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../database/schema/public/users.schema';

/**
 * Decorator to get current authenticated user from request
 *
 * @example
 * ```typescript
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
