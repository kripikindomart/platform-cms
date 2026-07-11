/**
 * Database Command
 * Manage database migrations per module
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.utils';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export function dbCommand(): Command {
  const cmd = new Command('db');

  cmd.description('Manage database migrations per module');

  // Generate migration for a module
  cmd
    .command('migrate <module>')
    .description('Generate and apply migration for a specific module')
    .option('--generate-only', 'Only generate migration file, do not apply')
    .option('--apply-only', 'Only apply existing migrations, do not generate new')
    .action(async (moduleName: string, options) => {
      try {
        logger.title(`Migration for module: ${moduleName}`);

        const workspaceRoot = getWorkspaceRoot();
        const backendPath = path.join(workspaceRoot, 'backend');

        // Check if module exists
        const moduleFileName = toKebabCase(pluralize(moduleName));
        const modulePath = path.join(backendPath, 'src/modules', moduleFileName);
        
        try {
          await fs.access(modulePath);
        } catch {
          logger.error(`Module "${moduleName}" not found at: ${modulePath}`);
          process.exit(1);
        }

        // Step 1: Generate migration (if not apply-only)
        if (!options.applyOnly) {
          logger.info('\n1. Generating migration...');
          
          try {
            const output = execSync('npm run migration:generate', {
              cwd: backendPath,
              encoding: 'utf-8',
              stdio: 'pipe',
            });
            
            logger.success('✓ Migration generated');
            
            // Parse output to get migration file name
            const migrationFileMatch = output.match(/(\d{4}_\w+\.sql)/);
            const migrationFile = migrationFileMatch ? migrationFileMatch[1] : null;
            
            if (migrationFile) {
              logger.info(`  Migration file: ${migrationFile}`);
              
              // Save metadata to database
              await saveMigrationMetadata(moduleName, migrationFile, workspaceRoot);
            }
          } catch (error: any) {
            logger.error(`Failed to generate migration: ${error.message}`);
            process.exit(1);
          }
        }

        // Step 2: Apply migration (if not generate-only)
        if (!options.generateOnly) {
          logger.info('\n2. Applying migration...');
          
          try {
            execSync('npm run migration:run', {
              cwd: backendPath,
              encoding: 'utf-8',
              stdio: 'inherit',
            });
            
            logger.success('✓ Migration applied successfully');
            
            // Update migration status in database
            await updateMigrationStatus(moduleName, true);
          } catch (error: any) {
            logger.error(`Failed to apply migration: ${error.message}`);
            process.exit(1);
          }
        }

        logger.success(`\n✓ Migration for "${moduleName}" completed!`);
      } catch (error) {
        logger.error(`Migration failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // Rollback migration for a module
  cmd
    .command('rollback <module>')
    .description('Rollback migration for a specific module')
    .option('--force', 'Skip confirmation prompt')
    .action(async (moduleName: string, options) => {
      try {
        logger.title(`Rollback migration for module: ${moduleName}`);

        const workspaceRoot = getWorkspaceRoot();
        
        // Get migration files for this module
        const migrations = await getMigrationsForModule(moduleName);
        
        if (migrations.length === 0) {
          logger.warn(`No migrations found for module "${moduleName}"`);
          return;
        }

        logger.info(`Found ${migrations.length} migration(s) for "${moduleName}":`);
        migrations.forEach((m: any) => logger.info(`  - ${m.migration_file} (${m.is_applied ? 'applied' : 'not applied'})`));

        // Confirmation
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Rollback ${migrations.length} migration(s)? This will DROP tables/columns created by this module.`,
              default: false,
            },
          ]);

          if (!confirm) {
            logger.info('Rollback cancelled');
            return;
          }
        }

        // Rollback each migration
        for (const migration of migrations) {
          if (!migration.is_applied) {
            logger.info(`Skipping ${migration.migration_file} (not applied)`);
            continue;
          }

          logger.info(`\nRolling back: ${migration.migration_file}`);
          
          try {
            // Generate down migration SQL
            const downSql = await generateDownMigration(migration, workspaceRoot);
            
            if (downSql) {
              // Execute rollback SQL
              await executeSQL(downSql, workspaceRoot);
              
              // Mark as rolled back
              await updateMigrationStatus(moduleName, false, migration.id);
              
              logger.success(`✓ Rolled back: ${migration.migration_file}`);
            } else {
              logger.warn(`⚠ Could not generate rollback SQL for ${migration.migration_file}`);
              logger.info(`  You may need to manually rollback this migration`);
            }
          } catch (error: any) {
            logger.error(`Failed to rollback ${migration.migration_file}: ${error.message}`);
          }
        }

        logger.success(`\n✓ Rollback for "${moduleName}" completed!`);
      } catch (error) {
        logger.error(`Rollback failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // List migrations for a module
  cmd
    .command('list [module]')
    .description('List migrations (all or for specific module)')
    .action(async (moduleName?: string) => {
      try {
        logger.title(moduleName ? `Migrations for module: ${moduleName}` : 'All migrations');

        const migrations = moduleName
          ? await getMigrationsForModule(moduleName)
          : await getAllMigrations();

        if (migrations.length === 0) {
          logger.info('No migrations found');
          return;
        }

        logger.info(`\nFound ${migrations.length} migration(s):\n`);
        
        migrations.forEach((m: any) => {
          const status = m.is_rolled_back
            ? '(rolled back)'
            : m.is_applied
            ? '(applied)'
            : '(pending)';
          
          logger.info(`  ${m.migration_file} ${status}`);
          logger.info(`    Module: ${m.module_name || 'unknown'}`);
          if (m.applied_at) {
            logger.info(`    Applied: ${new Date(m.applied_at).toLocaleString()}`);
          }
          logger.info('');
        });
      } catch (error) {
        logger.error(`Failed to list migrations: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Save migration metadata to database
 */
async function saveMigrationMetadata(
  moduleName: string,
  migrationFile: string,
  workspaceRoot: string,
): Promise<void> {
  // TODO: Call backend API to save migration metadata
  logger.info(`  Saving migration metadata for "${moduleName}"...`);
  // This will be implemented when backend is running
}

/**
 * Update migration status (applied/rolled back)
 */
async function updateMigrationStatus(
  moduleName: string,
  isApplied: boolean,
  migrationId?: number,
): Promise<void> {
  // TODO: Call backend API to update migration status
  logger.info(`  Updating migration status (applied: ${isApplied})...`);
}

/**
 * Get migrations for a specific module
 */
async function getMigrationsForModule(moduleName: string): Promise<any[]> {
  // TODO: Call backend API to get migrations
  logger.warn('  Database not connected - returning mock data');
  return [];
}

/**
 * Get all migrations
 */
async function getAllMigrations(): Promise<any[]> {
  // TODO: Call backend API to get all migrations
  logger.warn('  Database not connected - returning mock data');
  return [];
}

/**
 * Generate down migration SQL from up migration
 */
async function generateDownMigration(migration: any, workspaceRoot: string): Promise<string | null> {
  // Read the up migration file
  const migrationPath = path.join(workspaceRoot, migration.migration_path);
  
  try {
    const upSql = await fs.readFile(migrationPath, 'utf-8');
    
    // Parse SQL to generate reverse operations
    // This is a simplified implementation
    const lines = upSql.split('\n');
    const downStatements: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // CREATE TABLE -> DROP TABLE
      if (trimmed.match(/CREATE TABLE\s+"?(\w+)"?/i)) {
        const match = trimmed.match(/CREATE TABLE\s+"?(\w+)"?/i);
        if (match) {
          downStatements.push(`DROP TABLE IF EXISTS "${match[1]}" CASCADE;`);
        }
      }
      
      // ALTER TABLE ADD COLUMN -> ALTER TABLE DROP COLUMN
      if (trimmed.match(/ALTER TABLE\s+"?(\w+)"?\s+ADD COLUMN\s+"?(\w+)"?/i)) {
        const match = trimmed.match(/ALTER TABLE\s+"?(\w+)"?\s+ADD COLUMN\s+"?(\w+)"?/i);
        if (match) {
          downStatements.push(`ALTER TABLE "${match[1]}" DROP COLUMN IF EXISTS "${match[2]}";`);
        }
      }
    }
    
    if (downStatements.length === 0) {
      return null;
    }
    
    // Reverse order for proper rollback
    return downStatements.reverse().join('\n');
  } catch (error) {
    logger.warn(`  Could not read migration file: ${migrationPath}`);
    return null;
  }
}

/**
 * Execute SQL directly on database
 */
async function executeSQL(sql: string, workspaceRoot: string): Promise<void> {
  // TODO: Execute SQL via database connection
  logger.info(`  Executing rollback SQL...`);
  logger.info(`  SQL: ${sql.substring(0, 100)}...`);
  // This will be implemented with proper database connection
}

/**
 * Get workspace root (cross-platform)
 */
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd();
  workspaceRoot = path.normalize(workspaceRoot);
  
  if (workspaceRoot.endsWith('cli') || workspaceRoot.endsWith(path.join('cli', path.sep))) {
    workspaceRoot = path.join(workspaceRoot, '..');
  }
  
  return workspaceRoot;
}

/**
 * Helper: Convert to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Helper: Pluralize
 */
function pluralize(word: string): string {
  if (word.endsWith('s') && !word.endsWith('ss')) return word;
  if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
  return word + 's';
}
