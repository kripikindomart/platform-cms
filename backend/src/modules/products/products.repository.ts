import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import { products } from './entities/product.entity';

@Injectable()
export class ProductsRepository extends BaseRepository<typeof products.$inferSelect> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, products, tenantContext);
  }

  // Add custom query methods here
}
