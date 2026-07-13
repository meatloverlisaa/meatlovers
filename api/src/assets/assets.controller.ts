import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Public } from '../auth/public.decorator';

@Controller('assets')
@Public()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  getAssets(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('condition') condition?: string,
  ) {
    return this.assetsService.getAssets({ category, status, condition });
  }

  @Get('summary')
  getAssetsSummary() {
    return this.assetsService.getAssetsSummary();
  }

  @Get('depreciation')
  getDepreciationReport() {
    return this.assetsService.getDepreciationReport();
  }

  @Get('maintenance-due')
  getMaintenanceDue() {
    return this.assetsService.getMaintenanceDue();
  }

  @Get(':id')
  getAssetById(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Post()
  createAsset(@Body() data: any) {
    return this.assetsService.createAsset(data);
  }

  @Patch(':id')
  updateAsset(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.updateAsset(id, data);
  }

  @Delete(':id')
  deleteAsset(@Param('id') id: string) {
    return this.assetsService.deleteAsset(id);
  }

  // Maintenance Log Endpoints
  @Get(':id/maintenance')
  getAssetMaintenance(@Param('id') id: string) {
    return this.assetsService.getAssetMaintenance(id);
  }

  @Post(':id/maintenance')
  addMaintenanceLog(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.addMaintenanceLog(id, data);
  }

  @Patch('maintenance/:logId')
  updateMaintenanceLog(@Param('logId') logId: string, @Body() data: any) {
    return this.assetsService.updateMaintenanceLog(logId, data);
  }
}
