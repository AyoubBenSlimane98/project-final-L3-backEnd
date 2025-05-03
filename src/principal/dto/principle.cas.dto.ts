import { IsString, IsArray } from 'class-validator';

export class SetCasDto {
  @IsString()
  acteur: string;

  @IsArray()
  @IsString({ each: true })
  cas: string[];
}
