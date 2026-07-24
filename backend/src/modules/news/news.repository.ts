import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as tenantSchema from '@/database/schema/tenant';
import { TenantContextService } from '@/common/context/tenant-context.service';
import { news } from '@/database/schema/tenant/news.schema';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

/**
 * news Repository
 * Database access layer untuk news
 * 
 * @generated
 */
@Injectable()
export class NewsRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: NodePgDatabase<typeof tenantSchema>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Execute query in tenant schema context
   */
  private async withTenantSchema<T>(callback: () => Promise<T>): Promise<T> {
    const schemaName = this.tenantContext.getSchemaName();
    await this.db.execute(sql.raw(`SET search_path TO ${schemaName}, public`));
    try {
      return await callback();
    } finally {
      await this.db.execute(sql.raw('SET search_path TO public'));
    }
  }

  /**
   * Find all news dengan pagination & filtering
   */
  async findAll(query: QueryNewsDto) {
    const { page = 1, limit = 10, search, sort = 'id', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    return this.withTenantSchema(async () => {
      // Build WHERE conditions
      const conditions = [
        isNull(news.deleted_at),
      ];

      // Search
      if (search) {
        conditions.push(
          sql`(
            ${ news.title } ILIKE ${`%${search}%`}
          )`
        );
      }

      // Count total
      const [{ count }] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(news)
        .where(and(...conditions));

      // Get data
      const data = await this.db
        .select()
        .from(news)
        .where(and(...conditions))
        .orderBy(order === 'asc' ? asc((news as any)[sort]) : desc((news as any)[sort]))
        .limit(limit)
        .offset(offset);

      return {
        data,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    });
  }

  /**
   * Find news by ID
   */
  async findById(id: number) {
    return this.withTenantSchema(async () => {
      const [item] = await this.db
        .select()
        .from(news)
        .where(
          and(
            eq(news.id, id),
            isNull(news.deleted_at),
          )
        );

      return item || null;
    });
  }

  /**
   * Create new news
   */
  async create(dto: CreateNewsDto) {
    return this.withTenantSchema(async () => {
      const [created] = await this.db
        .insert(news)
        .values({
          uuid: dto.uuid,
          title: dto.title,
          content: dto.content,
          image: dto.image,
          date: dto.date,
          created_at: new Date(),
        })
        .returning();

      return created;
    });
  }

  /**
   * Update news
   */
  async update(id: number, dto: UpdateNewsDto) {
    return this.withTenantSchema(async () => {
      const [updated] = await this.db
        .update(news)
        .set({
          ...dto,
          updated_at: new Date(),
        })
        .where(eq(news.id, id))
        .returning();

      return updated;
    });
  }

  /**
   * Soft delete news
   */
  async softDelete(id: number) {
    return this.withTenantSchema(async () => {
      await this.db
        .update(news)
        .set({
          deleted_at: new Date(),
        })
        .where(eq(news.id, id));
    });
  }
}
