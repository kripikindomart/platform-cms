/**
 * Delete Command
 * Delete generated modules completely (files, imports, DB metadata)
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.utils';
import * as fs from 'fs/promises';
import * as path from 'path';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function deleteCommand(): Command {
  const cmd = new Command('delete');

  cmd
    .description('Delete generated modules (files, imports, DB metadata)')
    .alias('rm');

  // Delete module subcommand
  cmd
    .command('module <name>')
    .description('Delete a generated module completely')
    .option('--force', 'Skip confirmation prompt')
    .option('--keep-db', 'Keep database metadata (only delete files)')
    .action(async (name: string, options) => {
      try {
        logger.title(`Deleting module: ${name}`);

        // Confirmation prompt
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete module "${name}"? This will:
  - Delete all module files
  - Remove from app.module.ts
  ${!options.keepDb ? '- Delete database metadata' : ''}`,
              default: false,
            },
          ]);

          if (!confirm) {
            logger.info('Delete cancelled');
            return;
          }
        }

        // Calculate paths
        const workspaceRoot = getWorkspaceRoot();
        const moduleName = toPascalCase(pluralize(name));
        const moduleFileName = toKebabCase(pluralize(name));
        const modulePath = path.join(workspaceRoot, 'backend/src/modules', moduleFileName);
        const appModulePath = path.join(workspaceRoot, 'backend/src/app.module.ts');

        let deletedFiles = 0;
        let errors = 0;

        // 1. Delete module files
        logger.info(`\n1. Deleting module files...`);
        try {
          await fs.access(modulePath);
          await fs.rm(modulePath, { recursive: true, force: true });
          logger.success(`✓ Deleted: ${modulePath}`);
          deletedFiles++;
        } catch (error) {
          logger.warn(`⚠ Module folder not found: ${modulePath}`);
        }

        // 2. Remove from app.module.ts
        logger.info(`\n2. Removing from app.module.ts...`);
        try {
          const content = await fs.readFile(appModulePath, 'utf-8');

          // Remove import statement - handle both single line and multi-line imports
          const importRegex = new RegExp(
            `import\\s*{[^}]*${moduleName}Module[^}]*}\\s*from\\s*['"].*${moduleFileName}\\.module['"];?\\s*\\n?`,
            'g',
          );
          let updatedContent = content.replace(importRegex, '');

          // Remove from imports array - more precise matching
          // Match the module name followed by optional comma and whitespace
          const moduleInArrayRegex = new RegExp(
            `(\\s*${moduleName}Module\\s*,?\\s*(?=\\n|\\]))|(,\\s*${moduleName}Module\\s*(?=\\n|\\]))`,
            'g',
          );
          updatedContent = updatedContent.replace(moduleInArrayRegex, '');

          // Clean up any remaining issues:
          // 1. Double commas
          updatedContent = updatedContent.replace(/,(\s*),/g, ',');
          // 2. Comma before closing bracket
          updatedContent = updatedContent.replace(/,(\s*)\]/g, '$1]');
          // 3. Multiple newlines
          updatedContent = updatedContent.replace(/\n{3,}/g, '\n\n');

          await fs.writeFile(appModulePath, updatedContent, 'utf-8');
          logger.success(`✓ Removed from app.module.ts`);
        } catch (error) {
          logger.error(`✗ Failed to update app.module.ts: ${(error as Error).message}`);
          errors++;
        }

        // 3. Remove entity export from tenant schema
        logger.info(`\n3. Removing entity from tenant schema...`);
        try {
          const entityFileName = toKebabCase(singularize(name));
          const tenantSchemaPath = path.join(workspaceRoot, 'backend/src/database/schema/tenant/index.ts');
          const content = await fs.readFile(tenantSchemaPath, 'utf-8');

          // Remove export statement for entity
          let exportRegex = new RegExp(
            `export\\s*\\*\\s*from\\s*['"].*${entityFileName}\\.entity['"];?\\n?`,
            'g',
          );
          let updatedContent = content.replace(exportRegex, '');

          // Also remove export statement for schema file (if exists)
          const schemaFileName = toKebabCase(pluralize(name));
          exportRegex = new RegExp(
            `export\\s*\\*\\s*from\\s*['\"]\\.\/${schemaFileName}\\.schema['"];?\\n?`,
            'g',
          );
          updatedContent = updatedContent.replace(exportRegex, '');

          await fs.writeFile(tenantSchemaPath, updatedContent, 'utf-8');
          
          // Delete schema file if exists
          const schemaFilePath = path.join(workspaceRoot, 'backend/src/database/schema/tenant', `${schemaFileName}.schema.ts`);
          try {
            await fs.access(schemaFilePath);
            await fs.unlink(schemaFilePath);
            logger.success(`✓ Deleted schema file: ${schemaFileName}.schema.ts`);
          } catch (e) {
            // Schema file doesn't exist (module uses entity pattern)
            logger.success(`✓ Removed entity from tenant schema`);
          }
        } catch (error) {
          logger.warn(`⚠ Could not remove entity from tenant schema: ${(error as Error).message}`);
        }

        // 4. Delete junction tables (many-to-many)
        logger.info(`\n4. Deleting junction tables...`);
        try {
          const tenantSchemaPath = path.join(workspaceRoot, 'backend/src/database/schema/tenant');
          const tenantSchemaIndexPath = path.join(tenantSchemaPath, 'index.ts');
          
          // Find junction tables that include this module name
          const schemaFiles = await fs.readdir(tenantSchemaPath);
          const singularName = singularize(name);
          const pluralName = pluralize(name);
          
          let junctionTablesDeleted = 0;
          for (const file of schemaFiles) {
            // Check if it's a junction table (contains underscore and module name)
            if (file.endsWith('.schema.ts') && file.includes('_') && 
                (file.includes(singularName) || file.includes(pluralName))) {
              const junctionTablePath = path.join(tenantSchemaPath, file);
              await fs.unlink(junctionTablePath);
              
              // Remove from tenant schema index
              const content = await fs.readFile(tenantSchemaIndexPath, 'utf-8');
              const exportName = file.replace('.schema.ts', '');
              const exportRegex = new RegExp(
                `export\\s*\\*\\s*from\\s*['"]\\./${exportName}\\.schema['"];?\\n?`,
                'g',
              );
              const updatedContent = content.replace(exportRegex, '');
              await fs.writeFile(tenantSchemaIndexPath, updatedContent, 'utf-8');
              
              logger.success(`✓ Deleted junction table: ${file}`);
              junctionTablesDeleted++;
            }
          }
          
          if (junctionTablesDeleted === 0) {
            logger.info(`  No junction tables found`);
          }
        } catch (error) {
          logger.warn(`⚠ Could not delete junction tables: ${(error as Error).message}`);
        }

        // 5. Delete migration files
        logger.info(`\n5. Deleting migration files...`);
        try {
          const migrationsPath = path.join(workspaceRoot, 'backend/src/database/migrations');
          const metaPath = path.join(migrationsPath, 'meta');
          
          // Read migration files
          const migrationFiles = await fs.readdir(migrationsPath);
          
          let migrationsDeleted = 0;
          
          // Find migrations that contain the table name
          const tableName = toSnakeCase(pluralize(name));
          
          for (const file of migrationFiles) {
            if (file.endsWith('.sql')) {
              const filePath = path.join(migrationsPath, file);
              const content = await fs.readFile(filePath, 'utf-8');
              
              // Check if migration contains this table
              if (content.includes(`CREATE TABLE "${tableName}"`) || 
                  content.includes(`"${tableName}"`) ||
                  content.includes(`DROP TABLE "${tableName}"`)) {
                
                // Delete SQL file
                await fs.unlink(filePath);
                
                // Delete corresponding meta file
                const migrationNumber = file.split('_')[0];
                const metaFile = `${migrationNumber}_snapshot.json`;
                const metaFilePath = path.join(metaPath, metaFile);
                
                try {
                  await fs.unlink(metaFilePath);
                } catch (e) {
                  // Meta file might not exist
                }
                
                logger.success(`✓ Deleted migration: ${file}`);
                migrationsDeleted++;
              }
            }
          }
          
          // Update _journal.json
          const journalPath = path.join(metaPath, '_journal.json');
          const journalContent = await fs.readFile(journalPath, 'utf-8');
          const journal = JSON.parse(journalContent);
          
          // Filter out deleted migrations
          const originalLength = journal.entries.length;
          journal.entries = journal.entries.filter((entry: any) => {
            const sqlFile = `${entry.idx.toString().padStart(4, '0')}_${entry.tag}.sql`;
            return migrationFiles.includes(sqlFile);
          });
          
          if (journal.entries.length < originalLength) {
            await fs.writeFile(journalPath, JSON.stringify(journal, null, 2), 'utf-8');
            logger.success(`✓ Updated _journal.json (removed ${originalLength - journal.entries.length} entries)`);
          }
          
          if (migrationsDeleted === 0) {
            logger.info(`  No migration files found for this module`);
          } else {
            logger.success(`✓ Deleted ${migrationsDeleted} migration file(s)`);
          }
        } catch (error) {
          logger.warn(`⚠ Could not delete migration files: ${(error as Error).message}`);
        }

        // 5b. Delete permission migration
        logger.info(`\n5b. Deleting permission migration...`);
        try {
          const permissionsDir = path.join(workspaceRoot, 'backend/src/database/migrations/permissions');
          const permissionFile = `${name}-permissions.sql`;
          const permissionFilePath = path.join(permissionsDir, permissionFile);
          
          try {
            await fs.unlink(permissionFilePath);
            logger.success(`✓ Deleted permission migration: ${permissionFile}`);
          } catch (e) {
            logger.info(`  No permission migration found`);
          }
        } catch (error) {
          logger.warn(`⚠ Could not delete permission migration: ${(error as Error).message}`);
        }

        // 5c. Delete menu migration
        logger.info(`\n5c. Deleting menu migration...`);
        try {
          const menusDir = path.join(workspaceRoot, 'backend/src/database/migrations/menus');
          const menuFile = `${toKebabCase(name)}-menu.sql`;
          const menuFilePath = path.join(menusDir, menuFile);
          
          try {
            await fs.unlink(menuFilePath);
            logger.success(`✓ Deleted menu migration: ${menuFile}`);
          } catch (e) {
            logger.info(`  No menu migration found`);
          }
        } catch (error) {
          logger.warn(`⚠ Could not delete menu migration: ${(error as Error).message}`);
        }

        // 5d. Delete menu items from database
        if (!options.keepDb) {
          logger.info(`\n5d. Deleting menu items from database...`);
          try {
            await deleteMenuItemsFromDatabase(name, workspaceRoot);
          } catch (error) {
            logger.warn(`⚠ Could not delete menu items: ${(error as Error).message}`);
            logger.info(`  You can manually run: DELETE FROM menu_items WHERE module_name = '${toKebabCase(name)}';`);
          }
        }

        // 5e. Delete permissions from database
        if (!options.keepDb) {
          logger.info(`\n5e. Deleting permissions from database...`);
          try {
            await deletePermissionsFromDatabase(name, workspaceRoot);
          } catch (error) {
            logger.warn(`⚠ Could not delete permissions: ${(error as Error).message}`);
            logger.info(`  You can manually run: DELETE FROM permissions WHERE resource = '${name}';`);
          }
        }

        // 6. Delete database table (DROP TABLE)
        if (!options.keepDb) {
          logger.info(`\n6. Dropping database table...`);
          try {
            await dropDatabaseTable(name, workspaceRoot);
          } catch (error) {
            logger.warn(`⚠ Could not drop table: ${(error as Error).message}`);
            logger.info(`  You can manually drop: DROP TABLE IF EXISTS tenant_1.${toSnakeCase(pluralize(name))} CASCADE;`);
          }
        }

        // 7. Delete database metadata (soft delete)
        if (!options.keepDb) {
          logger.info(`\n7. Soft-deleting database metadata...`);
          try {
            const moduleName = pluralize(name);
            await softDeleteModuleMetadata(moduleName, workspaceRoot);
          } catch (error) {
            logger.warn(`⚠ Could not delete metadata: ${(error as Error).message}`);
            logger.info(`  You can manually run: UPDATE generated_modules SET deleted_at = NOW() WHERE name = '${pluralize(name)}';`);
          }
        }

        // Summary
        logger.info(`\n${'='.repeat(50)}`);
        if (errors === 0) {
          logger.success(`✓ Module "${name}" deleted successfully!`);
          logger.info(`  Files deleted: ${deletedFiles}`);
          logger.info(`  Imports removed: 1`);
        } else {
          logger.warn(`⚠ Module "${name}" partially deleted with ${errors} error(s)`);
        }
      } catch (error) {
        logger.error(`Failed to delete module: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // Delete all test modules
  cmd
    .command('test-modules')
    .description('Delete all test/demo modules (test-*, demo-*, example-*)')
    .option('--force', 'Skip confirmation prompt')
    .action(async (options) => {
      try {
        logger.title('Deleting test modules');

        const workspaceRoot = getWorkspaceRoot();
        const modulesPath = path.join(workspaceRoot, 'backend/src/modules');

        // Find test modules
        const allModules = await fs.readdir(modulesPath);
        const testModules = allModules.filter(
          (m) => m.startsWith('test-') || m.startsWith('demo-') || m.startsWith('example-'),
        );

        if (testModules.length === 0) {
          logger.info('No test modules found');
          return;
        }

        logger.info(`Found ${testModules.length} test module(s):`);
        testModules.forEach((m) => logger.info(`  - ${m}`));

        // Confirmation
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Delete all ${testModules.length} test module(s)?`,
              default: false,
            },
          ]);

          if (!confirm) {
            logger.info('Delete cancelled');
            return;
          }
        }

        // Delete each module
        let deleted = 0;
        for (const moduleName of testModules) {
          try {
            const modulePath = path.join(modulesPath, moduleName);
            await fs.rm(modulePath, { recursive: true, force: true });
            
            // Remove from app.module.ts
            const pascalName = toPascalCase(moduleName.replace(/-/g, '_'));
            const appModulePath = path.join(workspaceRoot, 'backend/src/app.module.ts');
            const content = await fs.readFile(appModulePath, 'utf-8');
            
            const importRegex = new RegExp(
              `import\\s*{\\s*${pascalName}Module\\s*}\\s*from\\s*['"].*${moduleName}\\.module['"];?\\n?`,
              'g',
            );
            let updatedContent = content.replace(importRegex, '');
            
            const moduleRegex = new RegExp(`\\s*,?\\s*${pascalName}Module\\s*,?`, 'g');
            updatedContent = updatedContent.replace(moduleRegex, '');
            updatedContent = updatedContent.replace(/,(\s*),/g, ',');
            
            await fs.writeFile(appModulePath, updatedContent, 'utf-8');
            
            logger.success(`✓ Deleted: ${moduleName}`);
            deleted++;
          } catch (error) {
            logger.error(`✗ Failed to delete ${moduleName}: ${(error as Error).message}`);
          }
        }

        logger.success(`\n✓ Deleted ${deleted}/${testModules.length} test module(s)`);
      } catch (error) {
        logger.error(`Failed to delete test modules: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Get workspace root (cross-platform)
 */
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd();
  
  // Normalize path
  workspaceRoot = path.normalize(workspaceRoot);
  
  // If in cli folder, go up one level
  if (workspaceRoot.endsWith('cli') || workspaceRoot.endsWith(path.join('cli', path.sep))) {
    workspaceRoot = path.join(workspaceRoot, '..');
  }
  
  return workspaceRoot;
}

/**
 * Helper: Convert to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
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
 * Helper: Convert to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
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

/**
 * Helper: Singularize
 */
function singularize(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

/**
 * Drop database table
 */
async function dropDatabaseTable(moduleName: string, workspaceRoot: string): Promise<void> {
  const tableName = toSnakeCase(pluralize(moduleName));
  
  // Read database config from .env
  const envPath = path.join(workspaceRoot, 'backend', '.env');
  const envContent = await fs.readFile(envPath, 'utf-8');
  
  const getEnvValue = (key: string): string => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  };
  
  const dbHost = getEnvValue('DB_HOST') || 'localhost';
  const dbPort = getEnvValue('DB_PORT') || '5432';
  const dbName = getEnvValue('DB_NAME') || 'platform_cms';
  const dbUser = getEnvValue('DB_USER') || 'postgres';
  const dbPassword = getEnvValue('DB_PASSWORD') || 'postgres';
  
  // Get default tenant from ENV
  const defaultTenant = getEnvValue('DEFAULT_TENANT_SLUG') || 'tenant_1';
  
  // Set password via environment
  const env = { ...process.env, PGPASSWORD: dbPassword };
  
  // Drop from tenant schema
  const dropTenantSQL = `DROP TABLE IF EXISTS ${defaultTenant}.${tableName} CASCADE;`;
  const psqlTenantCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${dropTenantSQL}"`;
  
  try {
    await execAsync(psqlTenantCommand, { env });
    logger.success(`✓ Dropped table: ${defaultTenant}.${tableName}`);
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      logger.info(`  Table ${defaultTenant}.${tableName} does not exist`);
    } else {
      logger.warn(`  ⚠ Failed to drop ${defaultTenant}.${tableName}: ${error.message}`);
    }
  }
  
  // Also drop from public schema (for cleanup)
  const dropPublicSQL = `DROP TABLE IF EXISTS public.${tableName} CASCADE;`;
  const psqlPublicCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${dropPublicSQL}"`;
  
  try {
    const { stdout } = await execAsync(psqlPublicCommand, { env });
    if (stdout.includes('DROP TABLE')) {
      logger.success(`✓ Dropped table: public.${tableName}`);
    }
  } catch (error: any) {
    // Ignore errors for public schema (might not exist)
  }
}

/**
 * Soft delete module metadata from generated_modules table
 */
async function softDeleteModuleMetadata(moduleName: string, workspaceRoot: string): Promise<void> {
  // Read database config from .env
  const envPath = path.join(workspaceRoot, 'backend', '.env');
  const envContent = await fs.readFile(envPath, 'utf-8');
  
  const getEnvValue = (key: string): string => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  };
  
  const dbHost = getEnvValue('DB_HOST') || 'localhost';
  const dbPort = getEnvValue('DB_PORT') || '5432';
  const dbName = getEnvValue('DB_NAME') || 'platform_cms';
  const dbUser = getEnvValue('DB_USER') || 'postgres';
  const dbPassword = getEnvValue('DB_PASSWORD') || 'postgres';
  
  // Soft delete using UPDATE
  const updateSQL = `UPDATE public.generated_modules SET deleted_at = NOW() WHERE name = '${moduleName}' AND deleted_at IS NULL;`;
  
  const psqlCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${updateSQL}"`;
  
  // Set password via environment
  const env = { ...process.env, PGPASSWORD: dbPassword };
  
  try {
    const { stdout } = await execAsync(psqlCommand, { env });
    
    // Check if any row was updated
    if (stdout.includes('UPDATE 1')) {
      logger.success(`✓ Soft-deleted metadata: ${moduleName}`);
    } else if (stdout.includes('UPDATE 0')) {
      logger.info(`  Metadata for ${moduleName} not found (might be already deleted)`);
    } else {
      logger.success(`✓ Updated metadata for: ${moduleName}`);
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete menu items from database (soft delete)
 */
async function deleteMenuItemsFromDatabase(moduleName: string, workspaceRoot: string): Promise<void> {
  const envPath = path.join(workspaceRoot, 'backend', '.env');
  const envContent = await fs.readFile(envPath, 'utf-8');
  
  const getEnvValue = (key: string): string => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  };
  
  const dbHost = getEnvValue('DB_HOST') || 'localhost';
  const dbPort = getEnvValue('DB_PORT') || '5432';
  const dbName = getEnvValue('DB_NAME') || 'platform_cms';
  const dbUser = getEnvValue('DB_USER') || 'postgres';
  const dbPassword = getEnvValue('DB_PASSWORD') || 'postgres';
  const defaultTenant = getEnvValue('DEFAULT_TENANT_SLUG') || 'tenant_demo_company';
  
  // Soft delete menu items
  const moduleSlug = toKebabCase(moduleName);
  const updateSQL = `
    SET search_path TO ${defaultTenant}, public;
    UPDATE menu_items 
    SET deleted_at = NOW(), deleted_by = NULL 
    WHERE module_name = '${moduleSlug}' AND deleted_at IS NULL;
  `;
  
  const psqlCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${updateSQL}"`;
  
  const env = { ...process.env, PGPASSWORD: dbPassword };
  
  try {
    const { stdout } = await execAsync(psqlCommand, { env });
    
    // Extract update count
    const match = stdout.match(/UPDATE (\d+)/);
    const count = match ? parseInt(match[1]) : 0;
    
    if (count > 0) {
      logger.success(`✓ Soft-deleted ${count} menu item(s) for module: ${moduleSlug}`);
    } else {
      logger.info(`  No menu items found for module: ${moduleSlug}`);
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete permissions from database (soft delete)
 */
async function deletePermissionsFromDatabase(moduleName: string, workspaceRoot: string): Promise<void> {
  const envPath = path.join(workspaceRoot, 'backend', '.env');
  const envContent = await fs.readFile(envPath, 'utf-8');
  
  const getEnvValue = (key: string): string => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  };
  
  const dbHost = getEnvValue('DB_HOST') || 'localhost';
  const dbPort = getEnvValue('DB_PORT') || '5432';
  const dbName = getEnvValue('DB_NAME') || 'platform_cms';
  const dbUser = getEnvValue('DB_USER') || 'postgres';
  const dbPassword = getEnvValue('DB_PASSWORD') || 'postgres';
  const defaultTenant = getEnvValue('DEFAULT_TENANT_SLUG') || 'tenant_demo_company';
  
  // Soft delete permissions
  const resource = moduleName;
  const updateSQL = `
    SET search_path TO ${defaultTenant}, public;
    UPDATE permissions 
    SET deleted_at = NOW(), deleted_by = NULL 
    WHERE resource = '${resource}' AND deleted_at IS NULL;
  `;
  
  const psqlCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${updateSQL}"`;
  
  const env = { ...process.env, PGPASSWORD: dbPassword };
  
  try {
    const { stdout } = await execAsync(psqlCommand, { env });
    
    // Extract update count
    const match = stdout.match(/UPDATE (\d+)/);
    const count = match ? parseInt(match[1]) : 0;
    
    if (count > 0) {
      logger.success(`✓ Soft-deleted ${count} permission(s) for resource: ${resource}`);
    } else {
      logger.info(`  No permissions found for resource: ${resource}`);
    }
  } catch (error: any) {
    throw error;
  }
}
