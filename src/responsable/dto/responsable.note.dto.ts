import { IsNumber, Min, Max } from 'class-validator';

export class CreateNoteDto {
  @IsNumber()
  @Min(0)
  @Max(12)
  note: number;
}
