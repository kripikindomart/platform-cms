import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileSystemService {
  private readonly logger = new Logger(FileSystemService.name);
  private readonly projectRoot = process.cwd();

  /**
   * Write file to disk (creates directories if needed)
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content, 'utf-8');
      
      this.logger.log(`File created: ${filePath}`);
    } catch (error: any) {
      this.logger.error(`Failed to write file ${filePath}: ${error.message}`);
      throw new Error(`File write failed: ${error.message}`);
    }
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete file ${filePath}: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
      this.logger.error(`Failed to read file ${filePath}: ${error.message}`);
      throw new Error(`File read failed: ${error.message}`);
    }
  }

  /**
   * Delete directory recursively
   */
  async deleteDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, dirPath);
    
    try {
      await fs.rm(fullPath, { recursive: true, force: true });
      this.logger.log(`Directory deleted: ${dirPath}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete directory ${dirPath}: ${error.message}`);
      throw error;
    }
  }
}
