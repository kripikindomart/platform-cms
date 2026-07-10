#!/usr/bin/env node

/**
 * Platform CMS CLI
 * Main entry point for the CLI tool
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new.command';
import { generateCommand } from './commands/generate.command';
import { migrateCommand } from './commands/migrate.command';
import { validateCommand } from './commands/validate.command';
import { deleteCommand } from './commands/delete.command';

// Create CLI program
const program = new Command();

// Configure program
program
  .name('cms')
  .description('Platform CMS CLI - Generate modules, CRUD, components')
  .version('0.1.0', '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// Add banner to help
program.addHelpText(
  'beforeAll',
  chalk.cyan.bold('\n  Platform CMS CLI\n') +
    chalk.gray('  Generate modules, CRUD, and components for Platform CMS\n'),
);

// Register commands
program.addCommand(newCommand());
program.addCommand(generateCommand());
program.addCommand(deleteCommand());
program.addCommand(migrateCommand());
program.addCommand(validateCommand());

// Add examples to help
program.addHelpText(
  'after',
  `
${chalk.bold('Examples:')}
  ${chalk.gray('$')} cms new my-project
  ${chalk.gray('$')} cms generate module users
  ${chalk.gray('$')} cms generate crud posts --fields="title:string,content:text"
  ${chalk.gray('$')} cms delete module posts
  ${chalk.gray('$')} cms delete test-modules
  ${chalk.gray('$')} cms generate component UserCard --type=card
  ${chalk.gray('$')} cms migrate run
  ${chalk.gray('$')} cms validate

${chalk.bold('Documentation:')}
  ${chalk.cyan('https://github.com/platform-cms/docs')}
`,
);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
