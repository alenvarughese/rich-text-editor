import { IsString, IsNotEmpty, IsObject } from 'class-validator';

// DTOs (Data Transfer Objects) define the shape of incoming request bodies.
// class-validator decorators run when ValidationPipe is enabled in main.js.

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title;          // Note title — must be a non-empty string

  @IsObject()
  @IsNotEmpty()
  content;        // Full Editor.js output object: { time, blocks, version }
}
