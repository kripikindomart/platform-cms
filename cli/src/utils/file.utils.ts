/**
 * File utility functions for CLI
 * Handles file system operations
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import prettier from 'prettier';
import { logger } from './logger.utils';

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Write file with content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Format code with Prettier
 */
export async function formatCode(content: string, filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  const parser = getParser(ext);

  try {
    return await prettier.format(content, {
      parser,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      semi: true,
      printWidth: 100,
    });
  } catch (error) {
    logger.warn(`Failed to format ${filePath}, returning unformatted code`);
    return content;
  }
}

/**
 * Get Prettier parser based on file extension
 */
function getParser(ext: string): string {
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
      return 'babel';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    case '.css':
      return 'css';
    case '.scss':
      return 'scss';
    case '.html':
      return 'html';
    default:
      return 'typescript';
  }
}

/**
 * Write file with prettier formatting
 */
export async function writeFormattedFile(
  filePath: string,
  content: string,
): Promise<void> {
  const formatted = await formatCode(content, filePath);
  await writeFile(filePath, formatted);
  logger.success(`Created: ${filePath}`);
}

/**
 * Copy file from source to destination
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  await ensureDir(path.dirname(destination));
  await fs.copy(source, destination);
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * Get files in directory (recursive)
 */
export async function getFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const nestedFiles = await getFiles(fullPath);
      files.push(...nestedFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
