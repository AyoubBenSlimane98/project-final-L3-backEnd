import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export enum TacheNoms {
  DiagrammeCasUtilisation = 'Diagramme de cas d’utilisation',
  DescriptionTextuelle = 'Description Textuelle',
  DescriptionGraphique = 'Description Graphique',
  DiagrammeClasseParticipative = 'Diagramme de classe participative',
  IHM = 'IHM',
  DiagrammeClasse = 'Diagramme de classe',
  DiagrammeSequenceDetaille = 'Diagramme de séquence détaillé',
  Developpement = 'Developpement',
}

export class CreateTacheDto {
  @IsInt()
  idB: number;

  @IsInt()
  idG: number;

  @IsInt()
  idS: number;

  @IsString()
  @IsNotEmpty()
  tache: string;

  @IsNotEmpty()
  nom: TacheNoms;

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
