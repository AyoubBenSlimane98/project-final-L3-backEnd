import { IsInt, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum TacheNoms {
  DiagrammeCasUtilisation,
  DescriptionTextuelle,
  DescriptionGraphique,
  DiagrammeClasseParticipative,
  IHM,
  DiagrammeClasse,
  DiagrammeSequenceDetaille,
  Developpement,
}

export class CreateTacheDto {
  @IsInt()
  idB: number;

  @IsInt()
  idG: number;

  @IsEnum(TacheNoms)
  tache: TacheNoms;

  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  rapportUrl: string;
}
export class CreateEtapeDto {
  @IsInt()
  idB: number;

  @IsInt()
  idEtape: number;

  @IsNotEmpty()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  rapportUrl: string;
}
export class CreateRapportMemoireDto {
  @IsInt()
  idB: number;

  @IsNotEmpty()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  rapportUrl: string;
}
