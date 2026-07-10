/**
 * Generate Command
 * Generates modules, CRUD, components, etc.
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.utils';
import { ModuleGenerator } from '../generators/module.generator';

export function generateCommand(): Command {
  const cmd = new Command('generate');

  cmd
    .description('Generate resources (module, crud, component, etc.)')
    .alias('g');

  // Module subcommand
  cmd
    .command('module <name>')
    .description('Generate a NestJS module')
    .option('--tenant', 'Enable tenant isolation')
    .option('--soft-delete', 'Enable soft delete')
    .option('--audit', 'Enable audit logging')
    .option('--dir <directory>', 'Output directory', 'backend/src/modules')
    .option('--dry-run', 'Show what would be generated without creating files')
    .option('--force', 'Overwrite existing files without prompting')
    .action(async (name: string, options) => {
      try {
        const generator = new ModuleGenerator({
          dryRun: options.dryRun,
          force: options.force,
          outputPath: process.cwd(),
        });

        await generator.generate(name, {
          tenant: options.tenant,
          softDelete: options.softDelete,
          audit: options.audit,
          dir: options.dir,
        });
      } catch (error) {
        logger.error(`Failed to generate module: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // CRUD subcommand
  cmd
    .command('crud <name>')
    .description('Generate full CRUD (module, controller, service, repository, DTOs)')
    .option('--fields <fields>', 'Field definitions (name:type,email:email)')
    .option('--tenant', 'Enable tenant isolation')
    .option('--soft-delete', 'Enable soft delete')
    .option('--audit', 'Add authentication guards')
    .option('--dir <directory>', 'Output directory', 'backend/src/modules')
    .option('--dry-run', 'Show what would be generated without creating files')
    .option('--force', 'Overwrite existing files without prompting')
    .action(async (name: string, options) => {
      try {
        const { CrudGenerator } = await import('../generators/crud.generator');
        
        const generator = new CrudGenerator({
          dryRun: options.dryRun,
          force: options.force,
          outputPath: process.cwd(),
        });

        await generator.generate(name, {
          fields: options.fields,
          tenant: options.tenant,
          softDelete: options.softDelete,
          audit: options.audit,
          dir: options.dir,
        });
      } catch (error) {
        logger.error(`Failed to generate CRUD: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // Component subcommand
  cmd
    .command('component <name>')
    .description('Generate a React component')
    .option('--type <type>', 'Component type (form, table, card)', 'default')
    .option('--dir <directory>', 'Output directory', 'components')
    .action(async (name: string, options) => {
      logger.title(`Generating component: ${name}`);

      // TODO: Implement in Task 5.4
      logger.info('This command will be implemented in Task 5.4');
      logger.info(`Component name: ${name}`);
      logger.info(`Component type: ${options.type}`);
      logger.info(`Directory: ${options.dir}`);
    });

  // Service subcommand
  cmd
    .command('service <name>')
    .description('Generate a NestJS service')
    .option('--dir <directory>', 'Output directory')
    .action(async (name: string) => {
      logger.info('Service generator will be implemented in future tasks');
      logger.info(`Service name: ${name}`);
    });

  // Controller subcommand
  cmd
    .command('controller <name>')
    .description('Generate a NestJS controller')
    .option('--dir <directory>', 'Output directory')
    .action(async (name: string) => {
      logger.info('Controller generator will be implemented in future tasks');
      logger.info(`Controller name: ${name}`);
    });

  // Repository subcommand
  cmd
    .command('repository <name>')
    .description('Generate a repository')
    .option('--dir <directory>', 'Output directory')
    .action(async (name: string) => {
      logger.info('Repository generator will be implemented in future tasks');
      logger.info(`Repository name: ${name}`);
    });

  return cmd;
}
