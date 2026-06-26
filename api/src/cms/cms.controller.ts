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
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Website Content Management — SUPER_ADMIN, ADMIN, MANAGER only.
 * All routes in this controller require a valid JWT with one of those roles.
 */
@Controller('cms')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  /** GET /cms/pages — list all pages; ?published=true for published only */
  @Get('pages')
  getPages(@Query('published') published?: string) {
    return this.cmsService.getPages(published === 'true');
  }

  /** POST /cms/pages — create a page or homepage section */
  @Post('pages')
  @HttpCode(HttpStatus.CREATED)
  createPage(@Body() createPageDto: CreatePageDto) {
    return this.cmsService.createPage(createPageDto);
  }

  /** PATCH /cms/pages/:id — update content page fields */
  @Patch('pages/:id')
  updatePage(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.cmsService.updatePage(id, updatePageDto);
  }

  /** PATCH /cms/pages/:id/publish — toggle publish status */
  @Patch('pages/:id/publish')
  togglePublish(@Param('id') id: string) {
    return this.cmsService.togglePublish(id);
  }
}
