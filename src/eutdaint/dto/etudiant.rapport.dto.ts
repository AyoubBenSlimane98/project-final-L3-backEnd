import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export enum TacheNom {
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

  @IsString()
  @IsNotEmpty()
  tache: string;

  @IsNotEmpty()
  nom: TacheNom;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  rapportUrl: string;
}
