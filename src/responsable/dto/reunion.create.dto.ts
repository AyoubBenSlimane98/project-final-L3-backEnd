import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateReunionDto {
  @IsString()
  titre: string;

  @IsString()
  remarque: string;

  @IsString()
  lien: string;

  @IsDateString()
  dateDebut: string;

  @IsInt()
  enseignantId: number;

  @IsInt()
  groupeId: number;
}
