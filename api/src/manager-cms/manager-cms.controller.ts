import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ManagerCmsService } from './manager-cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@prisma/client';

/**
 * Manager CMS Routes — VIEW-ONLY access for MANAGER role
 * MANAGER can view website content but cannot create, edit, or publish
 */
@Controller('manager/cms')
@Public()
export class ManagerCmsController {
  constructor(private readonly managerCmsService: ManagerCmsService) {}

  /**
   * GET /manager/cms/pages
   * View all pages with optional published filter
   * Query: ?published=true for published pages only
   */
  @Get('pages')
  getPages(@Query('published') published?: string) {
    return this.managerCmsService.getPages(published === 'true');
  }

  /**
   * GET /manager/cms/pages/:id
   * View a specific page by ID
   */
  @Get('pages/:id')
  getPageById(@Param('id') id: string) {
    return this.managerCmsService.getPageById(id);
  }

  /**
   * GET /manager/cms/pages/slug/:slug
   * View a specific page by slug
   */
  @Get('pages/slug/:slug')
  getPageBySlug(@Param('slug') slug: string) {
    return this.managerCmsService.getPageBySlug(slug);
  }

  /**
   * GET /manager/cms/stats
   * View CMS statistics (published vs draft, page types, etc.)
   */
  @Get('stats')
  getCmsStats() {
    return this.managerCmsService.getCmsStats();
  }
}
