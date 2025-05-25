export class AuthSignupDto {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: 'Male' | 'Female';
  role: 'Responsable' | 'Principale' | 'Principale / Responsable';
}
