/**
 * List Command
 * List all generated modules
 */

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

interface ModuleInfo {
  name: string;
  path: string;
  files: number;
  hasTests: boolean;
  hasEntity: boolean;
  hasMigration: boolean;
}

export function registerListCommand(program: Command): void {
  const listCmd = program
    .command('list')
    .description('List all generated modules')
    .option('-d, --detail', 'Show detailed information')
    .action(async (options) => {
      try {
        await listModules(options);
      } catch (error: any) {
        console.error(chalk.red('✗ Failed to list modules:'), error.message);
        process.exit(1);
      }
    });

  // Alias
  listCmd.alias('ls');
}

async function listModules(options: { detail?: boolean }): Promise<void> {
  console.log(chalk.bold('\nGenerated Modules'));
  console.log('='.repeat(50));

  // Detect workspace root
  const workspaceRoot = await detectWorkspaceRoot();
  const modulesDir = path.join(workspaceRoot, 'backend', 'src', 'modules');

  // Check if modules directory exists
  if (!(await fs.pathExists(modulesDir))) {
    console.log(chalk.yellow('\nℹ No modules directory found'));
    console.log(chalk.gray(`  Expected: ${modulesDir}`));
    return;
  }

  // Get all directories in modules folder
  const items = await fs.readdir(modulesDir);
  const modules: ModuleInfo[] = [];

  for (const item of items) {
    const itemPath = path.join(modulesDir, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      // Skip common/core modules
      if (['auth', 'users', 'roles', 'permissions', 'tenants', 'audit-logs'].includes(item)) {
        continue;
      }

      const moduleInfo = await getModuleInfo(item, itemPath);
      modules.push(moduleInfo);
    }
  }

  if (modules.length === 0) {
    console.log(chalk.yellow('\nℹ No generated modules found'));
    console.log(chalk.gray('  Use: cms generate crud <name> to create a module'));
    return;
  }

  // Sort by name
  modules.sort((a, b) => a.name.localeCompare(b.name));

  // Display modules
  console.log(chalk.gray(`\nFound ${modules.length} module(s):\n`));

  if (options.detail) {
    // Detailed view
    for (const module of modules) {
      console.log(chalk.cyan(`📦 ${module.name}`));
      console.log(chalk.gray(`   Path: ${module.path}`));
      console.log(chalk.gray(`   Files: ${module.files}`));
      console.log(chalk.gray(`   Tests: ${module.hasTests ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.gray(`   Entity: ${module.hasEntity ? chalk.green('✓') : chalk.red('✗')}`));
      console.log(chalk.gray(`   Migration: ${module.hasMigration ? chalk.green('✓') : chalk.red('✗')}`));
      console.log();
    }
  } else {
    // Simple list view
    for (const module of modules) {
      const testIcon = module.hasTests ? chalk.green('✓') : chalk.gray('○');
      const entityIcon = module.hasEntity ? chalk.green('✓') : chalk.gray('○');
      
      console.log(
        `  ${testIcon} ${chalk.cyan(module.name.padEnd(20))} ` +
        `${chalk.gray(`${module.files} files`).padEnd(20)} ` +
        `${entityIcon} entity`
      );
    }

    console.log();
    console.log(chalk.gray('Legend:'));
    console.log(chalk.gray(`  ${chalk.green('✓')} = has tests/entity`));
    console.log(chalk.gray(`  ${chalk.gray('○')} = missing tests/entity`));
    console.log();
    console.log(chalk.gray('Use --detail for more information'));
  }
}

async function getModuleInfo(name: string, modulePath: string): Promise<ModuleInfo> {
  // Count files
  const allFiles = await getAllFiles(modulePath);
  const files = allFiles.length;

  // Check for test files
  const hasTests = allFiles.some((f) => f.endsWith('.spec.ts'));

  // Check for entity
  const hasEntity = await fs.pathExists(path.join(modulePath, 'entities'));

  // Check for migration
  const workspaceRoot = await detectWorkspaceRoot();
  const migrationsDir = path.join(workspaceRoot, 'backend', 'src', 'database', 'migrations');
  const hasMigration = await checkMigrationExists(migrationsDir, name);

  return {
    name,
    path: modulePath,
    files,
    hasTests,
    hasEntity,
    hasMigration,
  };
}

async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      const nestedFiles = await getAllFiles(itemPath);
      files.push(...nestedFiles);
    } else {
      files.push(itemPath);
    }
  }

  return files;
}

async function checkMigrationExists(migrationsDir: string, moduleName: string): Promise<boolean> {
  if (!(await fs.pathExists(migrationsDir))) {
    return false;
  }

  const files = await fs.readdir(migrationsDir);
  const tableName = moduleName.replace(/-/g, '_');
  
  return files.some((f) => f.endsWith('.sql') && f.includes(tableName));
}

async function detectWorkspaceRoot(): Promise<string> {
  let currentDir = process.cwd();

  // Strategy 1: Check if we're already in workspace root (has backend/ and cli/ dirs)
  if (
    (await fs.pathExists(path.join(currentDir, 'backend'))) &&
    (await fs.pathExists(path.join(currentDir, 'cli')))
  ) {
    return currentDir;
  }

  // Strategy 2: Go up directories to find workspace root
  let maxAttempts = 3;
  while (maxAttempts > 0) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root

    if (
      (await fs.pathExists(path.join(parentDir, 'backend'))) &&
      (await fs.pathExists(path.join(parentDir, 'cli')))
    ) {
      return parentDir;
    }

    currentDir = parentDir;
    maxAttempts--;
  }

  // Strategy 3: Default to current directory
  return process.cwd();
}
