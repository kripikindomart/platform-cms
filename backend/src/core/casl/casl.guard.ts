import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, AppAbility } from './casl-ability.factory';
import { CHECK_POLICIES_KEY, PolicyHandler } from '@/common/decorators/check-policies.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler());

    // If no policies defined, allow access
    if (!policyHandlers || policyHandlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Build ability for user
    const ability = this.caslAbilityFactory.createForUser(user);

    // Check all policy handlers
    const allowed = policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));

    if (!allowed) {
      throw new UnauthorizedException('Anda tidak memiliki izin untuk mengakses resource ini');
    }

    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility): boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
