import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('home')
  getHomepage() {
    return this.websiteService.getHomepage();
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.websiteService.getPageBySlug(slug);
  }

  @Get('menu-highlights')
  getMenuHighlights() {
    return this.websiteService.getMenuHighlights();
  }

  @Post('leads')
  createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.websiteService.createLead(createLeadDto);
  }
}
