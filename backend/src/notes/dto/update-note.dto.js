import { IsString, IsObject, IsOptional } from 'class-validator';

// UpdateNoteDto — all fields are optional so you can PUT only what changed.

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title;

  @IsOptional()
  @IsObject()
  content;
}
