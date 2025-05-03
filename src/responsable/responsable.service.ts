import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReunionDto,
  CreateSujetDto,
  QuestionsOfGroupeDto,
  RepondreQuestionDto,
  UpdateResponsabiliteDto,
} from './dto';
import { SetCasDto } from 'src/principal/dto';

@Injectable()
export class ResponsableService {
  constructor(private readonly prisma: PrismaService) {}

  async createSujet(sub: number, createSujetDto: CreateSujetDto) {
    const { titre, description, references, prerequises } = createSujetDto;

    const foundCompte = await this.prisma.compte.findUnique({
      where: { idC: sub },
    });
    if (!foundCompte) {
      throw new NotFoundException('Cannot find any compte');
    }

    const foundEnsignantRes = await this.prisma.utilisateur.findUnique({
      where: {
        idC: foundCompte.idC,
      },
      select: {
        enseignant: {
          select: {
            idU: true,
            responsable: true,
          },
        },
      },
    });

    if (!foundEnsignantRes || !foundEnsignantRes.enseignant) {
      throw new NotFoundException('Cannot find any enseignant responsable');
    }
    const enseignantRId = foundEnsignantRes.enseignant.idU;
    const result = await this.prisma.$transaction(async (tx) => {
      const sujet = await tx.sujet.create({
        data: {
          titre,
          description,
          enseignantRId,
        },
        include: {
          reference: true,
          prerequis: true,
        },
      });

      if (references?.length) {
        await Promise.all(
          references.map(({ reference }) =>
            tx.referencesSujet.create({
              data: {
                reference,
                idS: sujet.idS,
              },
            }),
          ),
        );
      }

      if (prerequises?.length) {
        await Promise.all(
          prerequises.map(({ prerequis }) =>
            tx.prerequisSujet.create({
              data: {
                prerequis,
                idS: sujet.idS,
              },
            }),
          ),
        );
      }

      return sujet;
    });

    return { message: 'decription of sujt is created successfuly!', result };
  }
  async getAllRsponsableValid() {
    const responsable = await this.prisma.enseignantResponsable.findMany({
      select: {
        idU: true,
        enseignant: {
          select: {
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
    if (!responsable) throw new Error('can not found any responsable ');
    return responsable.map((r) => ({
      idU: r.idU,
      nom: r.enseignant.user.nom,
      prenom: r.enseignant.user.prenom.trim(),
    }));
  }

  async getSujetOfResponsable(enseignantId: number) {
    const enseignant = await this.prisma.enseignantResponsable.findUnique({
      where: { idU: enseignantId },
      select: {
        Sujet: {
          select: {
            idS: true,
            titre: true,
          },
        },
      },
    });
    if (!enseignant || !enseignant.Sujet || enseignant.Sujet.length === 0) {
      throw new Error('Aucun sujet trouvé pour cet enseignant responsable.');
    }

    return enseignant.Sujet.map((sujet) => ({
      idS: sujet.idS,
      titre: sujet.titre,
    }));
  }

  async createReunion(createReunionDto: CreateReunionDto) {
    try {
      const { titre, lien, enseignantId, groupeId, remarque, dateDebut } =
        createReunionDto;

      const existingReunion = await this.prisma.réunion.findFirst({
        where: {
          enseignantRId: enseignantId,
          idG: groupeId,
          dateDebut: new Date(dateDebut),
        },
      });

      if (existingReunion) {
        throw new BadRequestException(
          'Une réunion existe déjà avec ce groupe, enseignant et date.',
        );
      }

      // Create a new meeting (reunion)
      const reunion = await this.prisma.réunion.create({
        data: {
          titre: titre,
          remarque: remarque,
          lien: lien,
          dateDebut: new Date(dateDebut), // Ensure the date is in correct format
          enseignantRId: enseignantId,
          idG: groupeId,
        },
      });

      return {
        message: 'Réunion créée avec succès',
        reunion,
      };
    } catch (error) {
      console.error('Error creating reunion:', error);
      throw new BadRequestException(
        'Une erreur est survenue lors de la création de la réunion.',
      );
    }
  }

  async getResponsableOfReunion(sub: number): Promise<number> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { idC: sub },
      select: {
        enseignant: {
          select: {
            responsable: {
              select: { idU: true },
            },
          },
        },
      },
    });

    const responsableId = utilisateur?.enseignant?.responsable?.idU;

    if (!responsableId) {
      throw new ForbiddenException('No responsable found for this user.');
    }

    return responsableId;
  }

  async getGroupesOfResponsable(enseignantId: number) {
    const groupes = await this.prisma.groupe.findMany({
      where: {
        enseignantRId: enseignantId,
      },
    });

    if (groupes.length === 0) {
      throw new ForbiddenException('No groups found');
    }

    return groupes.map((groupe) => ({
      idG: groupe.idG,
      nom: groupe.nom,
    }));
  }

  async getAllQuestionOfGroupe(questionsOfGroupeDto: QuestionsOfGroupeDto) {
    const { groupeId, enseignantId } = questionsOfGroupeDto;
    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG: groupeId,
        enseignantRId: enseignantId,
      },
      select: {
        binomes: {
          select: {
            etudiant: {
              select: { idU: true },
            },
          },
        },
      },
    });

    if (!groupe) {
      throw new ForbiddenException('Aucun groupe trouvé pour cet enseignant');
    }

    // 2. Extraire tous les ID des étudiants du groupe
    const etudiantIds = groupe.binomes.flatMap((b) =>
      b.etudiant.map((e) => e.idU),
    );

    if (etudiantIds.length === 0) {
      throw new ForbiddenException('Aucun étudiant trouvé dans ce groupe');
    }

    // 3. Trouver les étudiants qui ont au moins une question en attente POUR cet enseignant
    const etudiantsWithPendingQuestions = await this.prisma.etudiant.findMany({
      where: {
        idU: { in: etudiantIds },
        Question: {
          some: {
            etat: { in: ['attandre', 'bloquer', 'repondre'] },
            enseignantRId: enseignantId,
          },
        },
      },
      select: {
        idU: true,
        user: {
          select: {
            image: true,
            bio: true,
          },
        },
        Question: {
          where: {
            etat: { in: ['attandre', 'bloquer', 'repondre'] },
            enseignantRId: enseignantId,
          },
          select: {
            idQ: true,
            question: true,
            reponse: true,
            etat: true,
          },
        },
      },
    });

    if (etudiantsWithPendingQuestions.length === 0) {
      throw new ForbiddenException(
        'Aucune question en attente trouvée pour ce groupe',
      );
    }

    return {
      message: 'Questions récupérées avec succès',
      data: etudiantsWithPendingQuestions,
    };
  }

  async repondreQuestion(dto: RepondreQuestionDto) {
    const { idQ, reponse } = dto;
    const question = await this.prisma.question.update({
      where: { idQ },
      data: { reponse, etat: 'repondre' },
    });

    if (!question) {
      throw new ForbiddenException('Cannot find any question');
    }

    return {
      success: true,
      message: 'Question answered by enseignant',
    };
  }

  async bloquerQuestion(idQ: number) {
    const question = await this.prisma.question.update({
      where: { idQ },
      data: { etat: 'bloquer' },
    });

    if (!question) {
      throw new ForbiddenException('Cannot find any question');
    }

    return {
      success: true,
      message: 'Question has been blocked by enseignant',
    };
  }

  async getAllBinomesByGroupe(idG: number) {
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
  async getAllBinomesByGroupeWithResponsabilte(idG: number) {
    const groupes = await this.prisma.groupe.findMany({
      where: { idG },
      select: {
        idG: true,
        nom: true,
        binomes: {
          select: {
            responsabilite: true, // تأكد من تضمين الـ responsabilite هنا
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
      return groupe.binomes.flatMap((binome) => {
        return binome.etudiant.map((etudiant) => ({
          idB: etudiant.idB,
          matricule: etudiant.matricule,
          fullName: `${etudiant.user.prenom} ${etudiant.user.nom}`,
          groupe: groupe.nom,
          responsabilite: binome.responsabilite || 'Pas disponible', // إضافة قيمة المسؤولية هنا
        }));
      });
    });

    return result;
  }

  async setCasOfSujet(idG: number, dto: SetCasDto) {
    const { cas, acteur } = dto;

    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG: idG,
      },
      select: {
        idS: true,
      },
    });

    if (!groupe) throw new ForbiddenException('cannot found any groupe');

    await this.prisma.cas.createMany({
      data: cas
        .filter(() => groupe.idS !== null)
        .map((c) => ({
          acteur: acteur,
          idS: groupe.idS as number,
          cas: c,
        })),
    });

    return {
      message: 'All cas added successfully',
    };
  }

  async getAllActorOfCas(idS: number) {
    const casOfsujets = await this.prisma.cas.findMany({
      where: {
        idS: idS,
      },
      select: {
        acteur: true,
      },
    });

    if (!casOfsujets || casOfsujets.length === 0)
      throw new ForbiddenException('cannot find any actor');

    const uniqueActors = Array.from(new Set(casOfsujets.map((c) => c.acteur)));

    return uniqueActors.map((acteur) => ({ acteur }));
  }

  async getAllCasofSujet(idS: number, acteur: string) {
    const casOfsujets = await this.prisma.cas.findMany({
      where: {
        idS: idS,
        acteur,
      },
      select: {
        idCas: true,
        statut: true,
        cas: true,
      },
    });
    if (!casOfsujets || casOfsujets.length === 0)
      throw new ForbiddenException(
        `No cas found for acteur "${acteur}" and idS "${idS}"`,
      );
    return casOfsujets.map((c) => ({
      idCas: c.idCas,
      cas: c.cas,
      statut: c.statut,
    }));
  }

  async getIdOfSujet(idG: number) {
    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG: idG,
      },
      select: {
        idS: true,
      },
    });
    if (!groupe) throw new ForbiddenException('cannot find any groupe');
    return {
      idS: groupe.idS,
    };
  }
  async updateCasofSujet(
    idS: number,
    idB: number,
    casArray: { cas: string; idCas: number }[],
  ) {
    const updates = casArray.map(({ idCas }) =>
      this.prisma.cas.update({
        where: { idCas },
        data: { idB, statut: true },
      }),
    );

    await Promise.all(updates);
    return { message: 'Cas updated successfully' };
  }
  async updateResponsabiliteBinome(idB: number, dto: UpdateResponsabiliteDto) {
    const binome = await this.prisma.binome.findUnique({
      where: { idB },
      select: {
        idG: true,
        responsabilite: true,
      },
    });

    if (!binome)
      throw new ForbiddenException(`Aucun binôme trouvé avec l'ID ${idB}`);

    // التحقق من أن نفس المسؤولية غير مستخدمة في نفس المجموعة من قبل بنوم آخر
    const existing = await this.prisma.binome.findFirst({
      where: {
        idG: binome.idG,
        responsabilite: dto.responsabilite,
        NOT: { idB }, // استثناء البنوم الحالي
      },
    });

    if (existing) {
      throw new ForbiddenException(
        `La responsabilité '${dto.responsabilite}' est déjà affectée à un autre binôme dans le même groupe.`,
      );
    }

    // تحديث المسؤولية
    await this.prisma.binome.update({
      where: { idB },
      data: {
        responsabilite: dto.responsabilite,
      },
    });

    return { message: 'Responsabilité affectée avec succès !' };
  }
}
