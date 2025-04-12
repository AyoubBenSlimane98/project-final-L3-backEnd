export class CreateSujetDto {
  titre: string;
  description: string;
  references?: ReferenceSujetDto[];
  prerequises?: PrerequisSujetDto[];
}
export class ReferenceSujetDto {
  reference: string;
}
export class PrerequisSujetDto {
  prerequis: string;
}
