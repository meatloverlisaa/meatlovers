import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages')
  getPages(@Query('published') published?: string) {
    return this.cmsService.getPages(published === 'true');
  }

  @Post('pages')
  createPage(@Body() createPageDto: CreatePageDto) {
    return this.cmsService.createPage(createPageDto);
  }

  @Patch('pages/:id')
  updatePage(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.cmsService.updatePage(id, updatePageDto);
  }

  @Patch('pages/:id/publish')
  togglePublish(@Param('id') id: string) {
    return this.cmsService.togglePublish(id);
  }
}
