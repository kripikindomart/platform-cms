/**
 * Delete Command
 * Delete generated modules completely (files, imports, DB metadata)
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.utils';
import * as fs from 'fs/promises';
import * as path from 'path';
import inquirer from 'inquirer';

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

          // Remove import statement
          const importRegex = new RegExp(
            `import\\s*{\\s*${moduleName}Module\\s*}\\s*from\\s*['"].*${moduleFileName}\\.module['"];?\\n?`,
            'g',
          );
          let updatedContent = content.replace(importRegex, '');

          // Remove from imports array
          const moduleRegex = new RegExp(`\\s*,?\\s*${moduleName}Module\\s*,?`, 'g');
          updatedContent = updatedContent.replace(moduleRegex, '');

          // Clean up double commas
          updatedContent = updatedContent.replace(/,(\s*),/g, ',');

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

          // Remove export statement
          const exportRegex = new RegExp(
            `export\\s*\\*\\s*from\\s*['"].*${entityFileName}\\.entity['"];?\\n?`,
            'g',
          );
          const updatedContent = content.replace(exportRegex, '');

          await fs.writeFile(tenantSchemaPath, updatedContent, 'utf-8');
          logger.success(`✓ Removed entity from tenant schema`);
        } catch (error) {
          logger.warn(`⚠ Could not remove entity from tenant schema: ${(error as Error).message}`);
        }

        // 4. Delete junction tables (many-to-many)
        logger.info(`\n4. Deleting junction tables...`);
        try {
          const migrationsPath = path.join(workspaceRoot, 'backend/src/database/migrations');
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
          const metaFiles = await fs.readdir(metaPath);
          
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

        // 6. Delete database metadata
        if (!options.keepDb) {
          logger.info(`\n4. Deleting database metadata...`);
          try {
            // TODO: Call CLI metadata service to soft delete module
            // For now, just show what would be done
            logger.info(`  Would delete metadata for module: ${name}`);
            logger.warn(`  ⚠ Database cleanup not yet implemented`);
            logger.info(`  You can manually delete from generated_modules table`);
          } catch (error) {
            logger.error(`✗ Failed to delete metadata: ${(error as Error).message}`);
            errors++;
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
