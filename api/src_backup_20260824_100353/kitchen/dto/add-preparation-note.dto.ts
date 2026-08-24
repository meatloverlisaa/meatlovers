import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class AddPreparationNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  note: string;

  @IsString()
  @IsOptional()
  item_id?: string;
}
