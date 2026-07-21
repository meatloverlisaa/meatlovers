import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { MANAGEMENT_ROLES, SYSTEM_ADMIN_ROLES } from '../auth/constants/role-groups';

/**
 * Website Content Management — Management roles only.
 * All routes in this controller require a valid JWT with management permissions.
 */
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  /** GET /cms/pages — list all pages; ?published=true for published only */
  @Get('pages')
  @Roles(...MANAGEMENT_ROLES)
  getPages(@Query('published') published?: string) {
    return this.cmsService.getPages(published === 'true');
  }

  /** POST /cms/pages — create a page or homepage section */
  @Post('pages')
  @Roles(...SYSTEM_ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createPage(@Body() createPageDto: CreatePageDto) {
    return this.cmsService.createPage(createPageDto);
  }

  /** PATCH /cms/pages/:id — update content page fields */
  @Patch('pages/:id')
  @Roles(...SYSTEM_ADMIN_ROLES)
  updatePage(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.cmsService.updatePage(id, updatePageDto);
  }

  /** PATCH /cms/pages/:id/publish — toggle publish status */
  @Patch('pages/:id/publish')
  @Roles(...SYSTEM_ADMIN_ROLES)
  togglePublish(@Param('id') id: string) {
    return this.cmsService.togglePublish(id);
  }
}
