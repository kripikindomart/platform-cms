import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as tenantSchema from '../../database/schema/tenant';
import { posts } from './entities/post.entity';

@Injectable()
export class PostsRepository extends BaseRepository<typeof posts.$inferSelect> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, posts, tenantContext);
  }

  // Add custom query methods here
}
