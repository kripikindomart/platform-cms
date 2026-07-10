import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as publicSchema from './schema/public';

@Injectable()
export class TenantSchemaService {
  private readonly logger = new Logger(TenantSchemaService.name);

  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof publicSchema>,
  ) {}

  /**
   * Create new tenant schema
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    // Validate schema name format (tenant_xxx)
    this.validateSchemaName(schemaName);

    // Check if schema already exists
    const exists = await this.schemaExists(schemaName);
    if (exists) {
      throw new Error(`Schema ${schemaName} already exists`);
    }

    try {
      this.logger.log(`Creating schema: ${schemaName}`);

      // Create schema
      await this.db.execute(
        sql.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`),
      );

      this.logger.log(`✓ Schema ${schemaName} created successfully`);
    } catch (error) {
      this.logger.error(`✗ Failed to create schema ${schemaName}:`, error);
      throw error;
    }
  }

  /**
   * Drop tenant schema (CASCADE)
   */
  async dropTenantSchema(schemaName: string): Promise<void> {
    // Validate schema name format
    this.validateSchemaName(schemaName);

    // Check if schema exists
    const exists = await this.schemaExists(schemaName);
    if (!exists) {
      throw new Error(`Schema ${schemaName} does not exist`);
    }

    try {
      this.logger.warn(`Dropping schema: ${schemaName} (CASCADE)`);

      // Drop schema with CASCADE (drops all objects)
      await this.db.execute(
        sql.raw(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`),
      );

      this.logger.log(`✓ Schema ${schemaName} dropped successfully`);
    } catch (error) {
      this.logger.error(`✗ Failed to drop schema ${schemaName}:`, error);
      throw error;
    }
  }

  /**
   * Check if schema exists
   */
  async schemaExists(schemaName: string): Promise<boolean> {
    const result = await this.db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = ${schemaName}
      ) as exists
    `);

    return result.rows[0]?.exists === true;
  }

  /**
   * List all tenant schemas
   */
  async listAllSchemas(): Promise<string[]> {
    const result = await this.db.execute(sql`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    return result.rows.map((row) => row.schema_name as string);
  }

  /**
   * Get schema table count
   */
  async getSchemaTableCount(schemaName: string): Promise<number> {
    const result = await this.db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM information_schema.tables
      WHERE table_schema = ${schemaName}
        AND table_type = 'BASE TABLE'
    `);

    const count = result.rows[0]?.count;
    return typeof count === 'number' ? count : 0;
  }

  /**
   * Validate schema name format
   */
  private validateSchemaName(schemaName: string): void {
    // Must match pattern: tenant_xxx (lowercase, alphanumeric, underscore only)
    const pattern = /^tenant_[a-z0-9_]+$/;

    if (!pattern.test(schemaName)) {
      throw new Error(
        `Invalid schema name format: ${schemaName}. Must match pattern: tenant_xxx (lowercase, alphanumeric, underscore only)`,
      );
    }

    // Additional safety check
    if (schemaName === 'public' || schemaName === 'information_schema') {
      throw new Error(`Cannot operate on system schema: ${schemaName}`);
    }
  }

  /**
   * Set search_path for current session
   */
  async setSearchPath(schemaName: string): Promise<void> {
    await this.db.execute(
      sql.raw(`SET search_path TO "${schemaName}", public`),
    );
  }

  /**
   * Reset search_path to default
   */
  async resetSearchPath(): Promise<void> {
    await this.db.execute(sql.raw(`RESET search_path`));
  }

  /**
   * Get schema info
   */
  async getSchemaInfo(schemaName: string): Promise<{
    exists: boolean;
    tableCount: number;
    size: string;
  }> {
    const exists = await this.schemaExists(schemaName);

    if (!exists) {
      return {
        exists: false,
        tableCount: 0,
        size: '0 bytes',
      };
    }

    const tableCount = await this.getSchemaTableCount(schemaName);

    // Get schema size
    const sizeResult = await this.db.execute(sql`
      SELECT pg_size_pretty(
        sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint
      ) as size
      FROM pg_tables
      WHERE schemaname = ${schemaName}
    `);

    return {
      exists: true,
      tableCount,
      size: (sizeResult.rows[0]?.size as string) || '0 bytes',
    };
  }
}
