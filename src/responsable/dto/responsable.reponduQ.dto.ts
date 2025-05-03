import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RepondreQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  idQ: number;

  @IsString()
  @IsNotEmpty()
  reponse: string;
}
