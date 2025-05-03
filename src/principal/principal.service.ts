import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  GroupeToSujetDto,
  PrincipalInfoProfil,
  PrincipalPasswordDto,
  UpdateBinomeGroupDto,
  UserDto,
} from './dto';
import { EncryptionService } from 'src/encryption/encryption.service';
import { TokenService } from 'src/token/token.service';
import { AuthSigninDto } from 'src/authentication/dto';
import { generateOTP } from 'src/util';

@Injectable()
export class PrincipalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getNumberGroupes() {
    const counts = await this.prisma.groupe.count();
    return {
      numberGroupe: counts,
    };
  }

  async getGroupe(id: number) {
    const existGroupe = await this.prisma.groupe.findUnique({
      where: { idG: id },
    });
    if (!existGroupe) throw new ForbiddenException('not exsit groupe new');
    return await this.prisma.binome.findMany({
      where: { idG: existGroupe.idG },
      select: {
        etudiant: {
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
      where: { idC: sub },
      select: {
        email: true,
        user: {
          omit: {
            idU: true,
            idC: true,
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
      where: { idC: sub },
    });
    if (!existUser)
      throw new ForbiddenException('not user with this information ');
    await this.prisma.utilisateur.update({
      where: {
        idU: existUser.idU,
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
      where: { idC: sub },
    });
    if (!existUser)
      throw new ForbiddenException('not user with this information ');
    await this.prisma.utilisateur.update({
      where: {
        idU: existUser.idU,
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
      where: { idC: sub },
    });
    if (!existCompte)
      throw new ForbiddenException('not user with this information ');

    const isMatches = await this.encryptionService.comparePasswords(
      oldPassword,
      existCompte.password,
    );
    if (!isMatches) {
      throw new ForbiddenException('pld password not correct ');
    }
    const hash = await this.encryptionService.hashPassword(newPassword);
    await this.prisma.compte.update({
      where: {
        idC: sub,
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
        Array.from({ length: numberOfGroups }).map((_, index) =>
          tx.groupe.create({
            data: {
              nom: `groupe ${index + 1}`,
              enseignantRId: null,
              idS: null,
            },
          }),
        ),
      );

      let currentGroupIndex = 0;
      let binomeCountInCurrentGroup = 0;

      for (const user of users) {
        const groupeId = createdGroupes[currentGroupIndex].idG;

        const binome = await tx.binome.create({
          data: {
            idG: groupeId,
          },
        });

        const compte1 = await tx.compte.create({
          data: {
            email: user.Etudaint1.email,
            password: await this.encryptionService.hashPassword(
              user.Etudaint1.matricul,
            ),
          },
        });
        const otp = generateOTP();
        const defaultBio1 = `@${user.Etudaint1.prenom}_${user.Etudaint1.nom}_${otp.slice(0, 3)}`;
        const utilisateur1 = await tx.utilisateur.create({
          data: {
            nom: user.Etudaint1.nom,
            prenom: user.Etudaint1.prenom,
            dateNaissance: user.Etudaint1.dateNaissance,
            sexe: user.Etudaint1.sexe,
            bio: defaultBio1,
            idC: compte1.idC,
          },
        });

        await tx.etudiant.create({
          data: {
            matricule: user.Etudaint1.matricul,
            idU: utilisateur1.idU,
            idB: binome.idB,
          },
        });

        if (user.Etudaint2) {
          const defaultBio2 = `@${user.Etudaint2.prenom}_${user.Etudaint2.nom}_${otp.slice(0, 3)}`;
          const compte2 = await tx.compte.create({
            data: {
              email: user.Etudaint2.email,
              password: await this.encryptionService.hashPassword(
                user.Etudaint2.matricul,
              ),
            },
          });

          const utilisateur2 = await tx.utilisateur.create({
            data: {
              nom: user.Etudaint2.nom,
              prenom: user.Etudaint2.prenom,
              dateNaissance: user.Etudaint2.dateNaissance,
              sexe: user.Etudaint2.sexe,
              bio: defaultBio2,
              idC: compte2.idC,
            },
          });

          await tx.etudiant.create({
            data: {
              matricule: user.Etudaint2.matricul,
              idU: utilisateur2.idU,
              idB: binome.idB,
            },
          });
        }

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
        groupes: createdGroupes.map((g) => ({ id: g.idG })),
      };
    });
  }

  async setGroupeAndSujet(groupeToSujetDto: GroupeToSujetDto) {
    const { groupeId, sujetId, enseignantId } = groupeToSujetDto;
    const groupe = await this.prisma.groupe.findUnique({
      where: { idG: groupeId },
    });

    if (!groupe) {
      throw new ForbiddenException('Groupe not found');
    }

    if (groupe.idS || groupe.enseignantRId) {
      throw new ForbiddenException(
        'This group already has a subject or a responsable',
      );
    }

    await this.prisma.groupe.update({
      where: {
        idG: groupeId,
      },
      data: {
        idS: sujetId,
        enseignantRId: enseignantId,
      },
    });

    return {
      message: 'Successfully assigned subject and responsable',
    };
  }

  async getAllGroupes() {
    const groupes = await this.prisma.groupe.findMany({
      select: {
        idG: true,
        nom: true,
      },
    });
    if (!groupes) throw new NotFoundException('can not found any groupes');
    return groupes;
  }

  async canSwitchAccount(sub: number) {
    const existentCompte = await this.prisma.compte.findUnique({
      where: { idC: sub },
      include: {
        user: {
          include: {
            enseignant: {
              include: {
                responsable: true,
              },
            },
          },
        },
      },
    });

    if (!existentCompte) {
      throw new ForbiddenException('Email or Password is not correct');
    }
    const utilisateur = existentCompte.user;
    if (!utilisateur?.enseignant?.responsable) {
      return {
        access: false,
      };
    }
    return {
      access: true,
    };
  }

  async switchAccount(authSigninDto: AuthSigninDto) {
    const { email, password } = authSigninDto;

    const existentCompte = await this.prisma.compte.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            enseignant: {
              include: {
                responsable: true,
              },
            },
          },
        },
      },
    });

    if (!existentCompte) {
      throw new ForbiddenException('Email or Password is not correct');
    }

    const isPasswordCorrect = await this.encryptionService.comparePasswords(
      password,
      existentCompte.password,
    );

    if (!isPasswordCorrect) {
      throw new ForbiddenException('Email or Password is not correct');
    }

    const utilisateur = existentCompte.user;

    if (!utilisateur?.enseignant?.responsable) {
      throw new ForbiddenException(
        'Access Denied: Only responsable accounts can login',
      );
    }

    const tokens = await this.tokenService.getTokens(
      existentCompte.idC,
      existentCompte.email,
    );

    await this.prisma.token.upsert({
      where: { compteId: existentCompte.idC },
      update: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.encryptionService.hashPassword(
          tokens.refreshtoken,
        ),
      },
      create: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.encryptionService.hashPassword(
          tokens.refreshtoken,
        ),
        compteId: existentCompte.idC,
      },
    });

    return {
      message: 'Login successful',
      token: tokens,
      role: 'enseignant_responsable',
    };
  }

  async getAllSujectAffecter() {
    const affctation = await this.prisma.groupe.findMany({
      where: {
        enseignantRId: { not: null },
        idS: { not: null },
      },
      select: {
        nom: true,
        enseignantResponsable: true,
        sujet: true,
      },
    });

    if (!affctation) {
      throw new ForbiddenException('Cannot find themes for groups');
    }

    return Promise.all(
      affctation.map(async (item) => {
        const user = await this.prisma.utilisateur.findUnique({
          where: { idU: item.enseignantResponsable?.idU },
          select: {
            nom: true,
            prenom: true,
          },
        });

        const sujet = await this.prisma.sujet.findUnique({
          where: {
            idS: item.sujet?.idS,
          },
          select: {
            titre: true,
          },
        });

        return {
          groupe: item.nom,
          fullName: user ? `${user.nom} ${user.prenom}` : 'Unknown Teacher',
          sujet: sujet?.titre ?? 'Unknown Subject',
        };
      }),
    );
  }

  async newGetAllBinomesByGroupe(idG: number) {
    const groupes = await this.prisma.groupe.findMany({
      where: { idG },
      select: {
        idG: true,
        nom: true,
        binomes: {
          select: {
            etudiant: {
              select: {
                idB: true,
                matricule: true,
                user: {
                  select: {
                    nom: true,
                    prenom: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (groupes.length === 0)
      throw new ForbiddenException('Cannot find any binomes');

    const result = groupes.flatMap((groupe) => {
      const binomesGrouped: Record<
        number,
        {
          idB: number;
          matricule: string;
          fullName: string;
          groupe: string;
        }[]
      > = {};

      groupe.binomes.forEach((binome) => {
        binome.etudiant.forEach((etudiant) => {
          if (!etudiant.idB) return;
          if (!binomesGrouped[etudiant.idB]) binomesGrouped[etudiant.idB] = [];

          binomesGrouped[etudiant.idB].push({
            idB: etudiant.idB,
            matricule: etudiant.matricule,
            fullName: `${etudiant.user.prenom} ${etudiant.user.nom}`,
            groupe: groupe.nom,
          });
        });
      });

      return Object.values(binomesGrouped).flat();
    });

    return result;
  }

  async getDataBinome(idB: number) {
    const binome = await this.prisma.binome.findUnique({
      where: { idB },
      select: {
        etudiant: {
          select: {
            idU: true,
            user: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    if (!binome) {
      throw new ForbiddenException('cannot find binome');
    }

    return binome.etudiant.map((etud) => ({
      idU: etud.idU,
      nom: etud.user.nom,
      prenom: etud.user.prenom,
    }));
  }
  async unlinkStudentsFromBinome(ids: number[]) {
    try {
      const deletedStudents = await this.prisma.etudiant.updateMany({
        where: {
          idU: {
            in: ids,
          },
        },
        data: {
          idB: null,
        },
      });

      if (deletedStudents.count === 0) {
        throw new Error('No students found to delete');
      }

      return {
        message: 'Students deleted successfully',
        deletedCount: deletedStudents.count,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error deleting students: ${error.message}`);
      }
      throw new Error('Error deleting students: Unknown error');
    }
  }

  async updateStudentsGroups(updateDto: UpdateBinomeGroupDto) {
    const updates = updateDto.updates;

    if (updates.length === 1) {
      const binome = await this.prisma.binome.create({
        data: {
          idG: updates[0].groupId,
        },
      });

      await this.prisma.etudiant.update({
        where: {
          idU: updates[0].studentId,
        },
        data: {
          idB: binome.idB,
        },
      });
    } else if (updates.length === 2) {
      if (updates[0].groupId === updates[1].groupId) {
        const binome = await this.prisma.binome.create({
          data: {
            idG: updates[0].groupId,
          },
        });

        const updatePromises = updates.map(async (update) => {
          return this.prisma.etudiant.update({
            where: {
              idU: update.studentId,
            },
            data: {
              idB: binome.idB,
            },
          });
        });

        await Promise.all(updatePromises);
      } else {
        const binomePromises = updates.map(async (update) => {
          const binome = await this.prisma.binome.create({
            data: {
              idG: update.groupId,
            },
          });

          await this.prisma.etudiant.update({
            where: {
              idU: update.studentId,
            },
            data: {
              idB: binome.idB,
            },
          });
        });

        await Promise.all(binomePromises);
      }
    }

    return { message: 'Binômes updated successfully', updates };
  }
}
