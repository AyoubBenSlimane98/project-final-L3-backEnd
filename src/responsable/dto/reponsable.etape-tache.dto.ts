import { IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EtapeDTO {
  @IsString()
  etape: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}

class TacheDTO {
  @IsString()
  tache: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}

export class CreateEtapePayloadDTO {
  @ValidateNested()
  @Type(() => EtapeDTO)
  etape: EtapeDTO;

  @ValidateNested({ each: true })
  @Type(() => TacheDTO)
  taches: TacheDTO[];
}
