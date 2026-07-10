/**
 * New Command
 * Creates a new Platform CMS project
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.utils';

export function newCommand(): Command {
  const cmd = new Command('new');

  cmd
    .description('Create a new Platform CMS project')
    .argument('<project-name>', 'Name of the project')
    .option('-d, --dir <directory>', 'Output directory', '.')
    .option('--skip-install', 'Skip npm install')
    .action(async (projectName: string, options) => {
      logger.title(`Creating new project: ${projectName}`);

      // TODO: Implement in future tasks
      logger.info('This command will be implemented in future tasks');
      logger.info(`Project name: ${projectName}`);
      logger.info(`Directory: ${options.dir}`);
      logger.info(`Skip install: ${options.skipInstall ? 'Yes' : 'No'}`);
    });

  return cmd;
}
