/**
 * Base Generator Class
 * Abstract class for all generators
 */

import * as path from 'path';
import inquirer from 'inquirer';
import { fileExists, writeFormattedFile } from '../utils/file.utils';
import { renderTemplate } from '../utils/template.utils';
import { logger } from '../utils/logger.utils';

export interface GeneratorOptions {
  dryRun?: boolean;
  force?: boolean;
  outputPath?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export abstract class BaseGenerator {
  constructor(protected options: GeneratorOptions = {}) {}

  /**
   * Generate files based on templates
   * Must be implemented by subclasses
   */
  abstract generate(name: string, data?: unknown): Promise<void>;

  /**
   * Render template with data
   */
  protected async renderTemplate(
    templatePath: string,
    data: Record<string, any>,
  ): Promise<string> {
    return renderTemplate(templatePath, data);
  }

  /**
   * Write file with prettier formatting
   */
  protected async writeFile(filePath: string, content: string): Promise<void> {
    // Resolve full path
    const fullPath = this.resolvePath(filePath);

    // Dry run mode
    if (this.options.dryRun) {
      logger.info(`[DRY RUN] Would create: ${fullPath}`);
      return;
    }

    // Check if file exists
    if ((await fileExists(fullPath)) && !this.options.force) {
      const shouldOverwrite = await this.promptOverwrite(fullPath);
      if (!shouldOverwrite) {
        logger.warn(`Skipped: ${fullPath}`);
        return;
      }
    }

    // Write file with formatting
    await writeFormattedFile(fullPath, content);
  }

  /**
   * Write multiple files
   */
  protected async writeFiles(files: GeneratedFile[]): Promise<void> {
    for (const file of files) {
      await this.writeFile(file.path, file.content);
    }
  }

  /**
   * Resolve file path (relative to output path or cwd)
   */
  protected resolvePath(filePath: string): string {
    if (this.options.outputPath) {
      return path.join(this.options.outputPath, filePath);
    }
    return path.join(process.cwd(), filePath);
  }

  /**
   * Prompt user for overwrite confirmation
   */
  protected async promptOverwrite(filePath: string): Promise<boolean> {
    const answers = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `File ${filePath} already exists. Overwrite?`,
        default: false,
      },
    ]);

    return answers.overwrite;
  }

  /**
   * Get template data with common properties
   */
  protected getTemplateData(
    name: string,
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      name,
      ...additionalData,
      timestamp: new Date().toISOString(),
      generator: this.constructor.name,
    };
  }

  /**
   * Log generation start
   */
  protected logStart(type: string, name: string): void {
    logger.title(`Generating ${type}: ${name}`);
  }

  /**
   * Log generation complete
   */
  protected logComplete(filesCount: number): void {
    logger.success(`\n✓ Generated ${filesCount} file(s) successfully!`);
  }

  /**
   * Log generation error
   */
  protected logError(error: Error): void {
    logger.error(`\n✗ Generation failed: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error);
    }
  }
}
