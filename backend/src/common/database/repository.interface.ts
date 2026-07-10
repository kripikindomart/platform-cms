/**
 * Base interfaces for repository pattern
 */

/**
 * Entity with soft delete support
 */
export interface SoftDeletable {
  deleted_at: Date | null;
  deleted_by: number | null;
}

/**
 * Entity with audit fields
 */
export interface Auditable {
  created_at: Date;
  updated_at: Date;
  created_by: number | null;
  updated_by: number | null;
}

/**
 * Base repository entity (must have ID, audit, and soft delete fields)
 */
export type RepositoryEntity = SoftDeletable &
  Auditable & {
    id: number;
  };

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Standard repository interface
 */
export interface IRepository<T extends RepositoryEntity> {
  /**
   * Find all active records
   */
  findAll(filters?: Record<string, unknown>): Promise<T[]>;

  /**
   * Find record by ID (exclude deleted)
   */
  findById(id: number): Promise<T | null>;

  /**
   * Create new record with audit fields
   */
  create(data: Partial<T>, userId?: number): Promise<T>;

  /**
   * Update record with audit fields
   */
  update(id: number, data: Partial<T>, userId?: number): Promise<T>;

  /**
   * Soft delete record
   */
  softDelete(id: number, userId?: number): Promise<void>;

  /**
   * Restore soft deleted record
   */
  restore(id: number): Promise<void>;

  /**
   * Hard delete record (use with caution!)
   */
  hardDelete(id: number): Promise<void>;

  /**
   * Find only deleted records
   */
  findDeleted(): Promise<T[]>;

  /**
   * Count active records
   */
  count(filters?: Record<string, unknown>): Promise<number>;

  /**
   * Find all with pagination
   */
  findAllPaginated(
    filters?: Record<string, unknown>,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<T>>;
}
