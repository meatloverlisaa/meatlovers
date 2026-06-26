import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { PageType } from '@prisma/client';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsEnum(PageType)
  page_type: PageType;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;
}
