export class PrinciplUserDto {
  id: number;
  Etudaint1: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    matricul: string;
    sexe: 'Female' | 'Male';
    dateNaissance: string;
  };
  Etudaint2: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    matricul: string;
    sexe: 'Female' | 'Male';
    dateNaissance: string;
  } | null;
}

export class UserDto {
  users: PrinciplUserDto[];
}
