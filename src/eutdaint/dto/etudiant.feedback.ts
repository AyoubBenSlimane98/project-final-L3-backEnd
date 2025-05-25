import { IsEnum, IsInt, IsString } from 'class-validator';
import { Responsabilite } from '@prisma/client';

export class CreateFeedbackDto {
  @IsEnum(Responsabilite, {
    message: 'responsabilite must be a valid enum value',
  })
  responsabilite: Responsabilite;

  @IsInt({ message: 'idG must be an integer' })
  idG: number;

  @IsString({ message: 'description must be a string' })
  description: string;
}
