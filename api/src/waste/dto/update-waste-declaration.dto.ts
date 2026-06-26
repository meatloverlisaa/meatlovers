import { PartialType } from '@nestjs/mapped-types';
import { CreateWasteDeclarationDto } from './create-waste-declaration.dto';

export class UpdateWasteDeclarationDto extends PartialType(CreateWasteDeclarationDto) {}
