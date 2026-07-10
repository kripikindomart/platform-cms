import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CliMetadataService } from './cli-metadata.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('cli/metadata')
@UseGuards(JwtAuthGuard)
export class CliMetadataController {
  constructor(private metadataService: CliMetadataService) {}

  /**
   * Get all modules
   * GET /api/cli/metadata/modules
   */
  @Get('modules')
  async getAllModules(
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<{ modules: unknown[] }> {
    const modules = await this.metadataService.getAllModules(
      includeDeleted === 'true',
    );
    return { modules };
  }

  /**
   * Get module by name
   * GET /api/cli/metadata/modules/:name
   */
  @Get('modules/:name')
  async getModule(@Param('name') name: string): Promise<{ module: unknown }> {
    const module = await this.metadataService.getModuleByName(name);
    return { module };
  }

  /**
   * Get module with fields
   * GET /api/cli/metadata/modules/:name/fields
   */
  @Get('modules/:name/fields')
  async getModuleWithFields(@Param('name') name: string): Promise<{ module: unknown }> {
    const module = await this.metadataService.getModuleWithFields(name);
    return { module };
  }

  /**
   * Get module fields only
   * GET /api/cli/metadata/modules/:name/fields-only
   */
  @Get('modules/:name/fields-only')
  async getModuleFields(@Param('name') name: string): Promise<{ fields: unknown[] }> {
    const fields = await this.metadataService.getModuleFields(name);
    return { fields };
  }

  /**
   * Get generation history
   * GET /api/cli/metadata/history
   */
  @Get('history')
  async getHistory(
    @Query('limit') limit?: string,
  ): Promise<{ history: unknown[]; count: number }> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const history = await this.metadataService.getHistory(parsedLimit);
    return {
      history,
      count: history.length,
    };
  }

  /**
   * Get history by module
   * GET /api/cli/metadata/modules/:name/history
   */
  @Get('modules/:name/history')
  async getModuleHistory(@Param('name') name: string): Promise<{ history: unknown[] }> {
    const history = await this.metadataService.getHistoryByModule(name);
    return { history };
  }

  /**
   * Get statistics
   * GET /api/cli/metadata/statistics
   */
  @Get('statistics')
  async getStatistics(): Promise<{ statistics: unknown }> {
    const statistics = await this.metadataService.getStatistics();
    return { statistics };
  }
}
