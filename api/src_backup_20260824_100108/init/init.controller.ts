import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { InitService } from './init.service';
import { Public } from '../auth/public.decorator';

@Controller('init')
export class InitController {
  constructor(private readonly initService: InitService) {}

  /**
   * POST /init/seed-database
   * One-time initialization endpoint to seed the database
   * This endpoint is public but can only be called once
   */
  @Public()
  @Post('seed-database')
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    return this.initService.seedDatabase();
  }
}
