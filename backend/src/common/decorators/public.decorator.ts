import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (skip JWT authentication)
 *
 * @example
 * ```typescript
 * @Post('login')
 * @Public()
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
