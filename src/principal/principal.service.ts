import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrincipalInfoProfil, PrincipalPasswordDto, UserDto } from './dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}
  async getNumberGroupes() {
    const counts = await this.prisma.groupe.count();
    return {
      numberGroupe: counts,
    };
  }
  async getGroupe(id: number) {
    const existGroupe = await this.prisma.groupe.findUnique({ where: { id } });
    if (!existGroupe) throw new ForbiddenException('not exsit groupe new');
    return await this.prisma.binome.findMany({
      where: { groupeId: existGroupe.id },
      select: {
        etudiant1: {
          select: {
            matricule: true,
            user: {
              select: {
                nom: true,
                prenom: true,
                sexe: true,
                compte: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        etudiant2: {
          select: {
            matricule: true,
            user: {
              select: {
                nom: true,
                sexe: true,
                prenom: true,
                compte: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async getPrincipal(sub: number) {
    const existentPrincipal = await this.prisma.compte.findUnique({
      relationLoadStrategy: 'join',
      where: { id: sub },
      select: {
        email: true,
        user: {
          omit: {
            id: true,
            compteId: true,
          },
        },
      },
    });
    if (!existentPrincipal) {
      throw new ForbiddenException('Ensiegnant principale not exist');
    }
    return existentPrincipal;
  }
  async updateImageProfile(sub: number, image: string) {
    const existUser = await this.prisma.utilisateur.findUnique({
      where: { compteId: sub },
    });
    if (!existUser)
      throw new ForbiddenException('not user with this information ');
    await this.prisma.utilisateur.update({
      where: {
        id: existUser.id,
      },
      data: {
        image,
      },
    });
    return {
      message: 'image profil change',
    };
  }
  async updateInfoProfile(
    sub: number,
    principalInfoProfil: PrincipalInfoProfil,
  ) {
    const existUser = await this.prisma.utilisateur.findUnique({
      where: { compteId: sub },
    });
    if (!existUser)
      throw new ForbiddenException('not user with this information ');
    await this.prisma.utilisateur.update({
      where: {
        id: existUser.id,
      },
      data: {
        ...principalInfoProfil,
      },
    });
    return {
      message: 'info profil change',
    };
  }
  async updatepasswordProfile(
    sub: number,
    principalPasswordDto: PrincipalPasswordDto,
  ) {
    const { newPassword, oldPassword } = principalPasswordDto;
    const existCompte = await this.prisma.compte.findUnique({
      where: { id: sub },
    });
    if (!existCompte)
      throw new ForbiddenException('not user with this information ');

    const isMatches = await this.comparePasswords(
      oldPassword,
      existCompte.password,
    );
    if (!isMatches) {
      throw new ForbiddenException('pld password not correct ');
    }
    const hash = await this.hashPassword(newPassword);
    await this.prisma.compte.update({
      where: {
        id: sub,
      },
      data: {
        password: hash,
      },
    });
    return {
      message: 'password change ',
    };
  }

  async createAllUserOfProject(
    numberOfGroups: number,
    users: UserDto['users'],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const totalBinomes = users.length;
      const binomesPerGroup = Math.ceil(totalBinomes / numberOfGroups);

      const createdGroupes = await Promise.all(
        Array.from({ length: numberOfGroups }).map(() =>
          tx.groupe.create({
            data: {
              enseignantId: null,
            },
          }),
        ),
      );

      let currentGroupIndex = 0;
      let binomeCountInCurrentGroup = 0;

      for (const user of users) {
        const compte1 = await tx.compte.create({
          data: {
            email: user.Etudaint1.email,
            password: await this.hashPassword(user.Etudaint1.matricul),
          },
        });

        const utilisateur1 = await tx.utilisateur.create({
          data: {
            nom: user.Etudaint1.nom,
            prenom: user.Etudaint1.prenom,
            dateNaissance: user.Etudaint1.dateNaissance,
            sexe: user.Etudaint1.sexe,
            compteId: compte1.id,
          },
        });

        const etu1 = await tx.etudiant.create({
          data: {
            matricule: user.Etudaint1.matricul,
            userId: utilisateur1.id,
          },
        });

        let etu2Id: number | null = null;

        if (user.Etudaint2) {
          const compte2 = await tx.compte.create({
            data: {
              email: user.Etudaint2.email,
              password: await this.hashPassword(user.Etudaint2.matricul),
            },
          });

          const utilisateur2 = await tx.utilisateur.create({
            data: {
              nom: user.Etudaint2.nom,
              prenom: user.Etudaint2.prenom,
              dateNaissance: user.Etudaint2.dateNaissance,
              sexe: user.Etudaint2.sexe,
              compteId: compte2.id,
            },
          });

          const etu2 = await tx.etudiant.create({
            data: {
              matricule: user.Etudaint2.matricul,
              userId: utilisateur2.id,
            },
          });

          etu2Id = etu2.id;
        }

        const groupeId = createdGroupes[currentGroupIndex].id;

        await tx.binome.create({
          data: {
            etudiant1Id: etu1.id,
            etudiant2Id: etu2Id ?? undefined,
            groupeId,
          },
        });

        binomeCountInCurrentGroup++;

        if (
          binomeCountInCurrentGroup >= binomesPerGroup &&
          currentGroupIndex < numberOfGroups - 1
        ) {
          currentGroupIndex++;
          binomeCountInCurrentGroup = 0;
        }
      }

      return {
        message: 'Groupes and binômes created successfully',
        groupes: createdGroupes.map((g) => ({ id: g.id })),
      };
    });
  }

  hashPassword = async (plainPassword: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  };
  comparePasswords = async (
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  };
}
