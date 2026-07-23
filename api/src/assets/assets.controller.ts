import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MANAGEMENT_ROLES, FINANCE_ROLES } from '../auth/constants/role-groups';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @Roles(...FINANCE_ROLES)
  getAssets(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('condition') condition?: string,
  ) {
    return this.assetsService.getAssets({ category, status, condition });
  }

  @Get('summary')
  @Roles(...FINANCE_ROLES)
  getAssetsSummary() {
    return this.assetsService.getAssetsSummary();
  }

  @Get('depreciation')
  @Roles(...FINANCE_ROLES)
  getDepreciationReport() {
    return this.assetsService.getDepreciationReport();
  }

  @Get('maintenance-due')
  @Roles(...MANAGEMENT_ROLES)
  getMaintenanceDue() {
    return this.assetsService.getMaintenanceDue();
  }

  @Get(':id')
  @Roles(...FINANCE_ROLES)
  getAssetById(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Post()
  @Roles(...MANAGEMENT_ROLES)
  createAsset(@Body() data: any) {
    return this.assetsService.createAsset(data);
  }

  @Patch(':id')
  @Roles(...MANAGEMENT_ROLES)
  updateAsset(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.updateAsset(id, data);
  }

  @Delete(':id')
  @Roles(...MANAGEMENT_ROLES)
  deleteAsset(@Param('id') id: string) {
    return this.assetsService.deleteAsset(id);
  }

  // Maintenance Log Endpoints
  @Get(':id/maintenance')
  @Roles(...MANAGEMENT_ROLES)
  getAssetMaintenance(@Param('id') id: string) {
    return this.assetsService.getAssetMaintenance(id);
  }

  @Post(':id/maintenance')
  @Roles(...MANAGEMENT_ROLES)
  addMaintenanceLog(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.addMaintenanceLog(id, data);
  }

  @Patch('maintenance/:logId')
  @Roles(...MANAGEMENT_ROLES)
  updateMaintenanceLog(@Param('logId') logId: string, @Body() data: any) {
    return this.assetsService.updateMaintenanceLog(logId, data);
  }
}
