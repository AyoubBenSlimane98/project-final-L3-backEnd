import { IsArray, IsInt } from 'class-validator';

export class CreatePresenceDto {
  @IsInt()
  etudiantId: number;

  @IsArray()
  presences: { idDP: number; etat: string }[];
}
