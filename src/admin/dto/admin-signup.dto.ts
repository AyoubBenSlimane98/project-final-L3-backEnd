export class AdminSignupDto {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: 'Male' | 'Female';
}
