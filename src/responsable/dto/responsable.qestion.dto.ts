import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionsOfGroupeDto {
  @Type(() => Number)
  @IsInt()
  groupeId: number;

  @Type(() => Number)
  @IsInt()
  enseignantId: number;
}
