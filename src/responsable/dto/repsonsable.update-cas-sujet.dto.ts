import { IsArray, IsObject, IsNumber, IsString } from 'class-validator';

class CasItem {
  @IsString()
  cas: string;

  @IsNumber()
  idCas: number;
}

export class UpdateCasSujetDto {
  @IsArray()
  @IsObject({ each: true })
  cas: CasItem[];
}
