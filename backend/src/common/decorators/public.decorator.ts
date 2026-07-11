import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

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
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
