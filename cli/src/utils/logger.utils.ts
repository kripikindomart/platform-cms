/**
 * Logger utilities for CLI
 * Provides colored console output
 */

import chalk from 'chalk';

export const logger = {
  /**
   * Log success message (green)
   */
  success(message: string): void {
    console.log(chalk.green('✓'), message);
  },

  /**
   * Log error message (red)
   */
  error(message: string): void {
    console.error(chalk.red('✗'), message);
  },

  /**
   * Log warning message (yellow)
   */
  warn(message: string): void {
    console.warn(chalk.yellow('⚠'), message);
  },

  /**
   * Log info message (blue)
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  },

  /**
   * Log plain message
   */
  log(message: string): void {
    console.log(message);
  },

  /**
   * Log title with underline
   */
  title(message: string): void {
    console.log(chalk.bold.cyan('\n' + message));
    console.log(chalk.cyan('='.repeat(message.length)) + '\n');
  },

  /**
   * Log section header
   */
  section(message: string): void {
    console.log(chalk.bold('\n' + message + ':'));
  },

  /**
   * Log debug message (gray) - only in debug mode
   */
  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message);
    }
  },
};
