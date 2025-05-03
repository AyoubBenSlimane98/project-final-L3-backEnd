import { IsEnum } from 'class-validator';

export enum ResponsabiliteEnum {
  chapter_1 = 'chapter_1',
  chapter_2 = 'chapter_2',
  chapter_3 = 'chapter_3',
  introduction_resume_conclustion = 'introduction_resume_conclustion',
}
export class UpdateResponsabiliteDto {
  @IsEnum(ResponsabiliteEnum, {
    message:
      'Responsabilité invalide. Valeurs acceptées : chapter_1, chapter_2, chapter_3, introduction_resume_conclustion',
  })
  responsabilite: ResponsabiliteEnum;
}
