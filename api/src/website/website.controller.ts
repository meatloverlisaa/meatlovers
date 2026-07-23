import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebsiteService } from './website.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Public } from '../auth/public.decorator';

/** All website endpoints are public — no auth required. */
@Controller('website')
@Public()
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
  @HttpCode(HttpStatus.CREATED)
  createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.websiteService.createLead(createLeadDto);
  }
}
