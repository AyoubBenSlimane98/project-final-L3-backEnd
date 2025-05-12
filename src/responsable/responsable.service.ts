import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEtapePayloadDTO,
  CreateReunionDto,
  CreateSujetDto,
  QuestionsOfGroupeDto,
  RepondreQuestionDto,
  UpdateResponsabiliteDto,
} from './dto';
import { SetCasDto } from 'src/principal/dto';
import { EtapeNom, EtatPresence, EtatRapport, TacheNom } from '@prisma/client';

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

    const existing = await this.prisma.binome.findFirst({
      where: {
        idG: binome.idG,
        responsabilite: dto.responsabilite,
        NOT: { idB },
      },
    });

    if (existing) {
      throw new ForbiddenException(
        `La responsabilité '${dto.responsabilite}' est déjà affectée à un autre binôme dans le même groupe.`,
      );
    }

    await this.prisma.binome.update({
      where: { idB },
      data: {
        responsabilite: dto.responsabilite,
      },
    });

    return { message: 'Responsabilité affectée avec succès !' };
  }

  async createEtapeTache(
    idS: number,
    createEtapePayloadDTO: CreateEtapePayloadDTO,
  ) {
    console.log(idS, createEtapePayloadDTO);
    const { etape, taches } = createEtapePayloadDTO;

    const etapeNom = EtapeNom[etape.etape as keyof typeof EtapeNom];
    if (!etapeNom) {
      throw new ForbiddenException('Invalid Etape value');
    }
    const existingEtape = await this.prisma.etape.findFirst({
      where: {
        nom: etapeNom,
        idS,
      },
    });
    if (existingEtape) {
      throw new ForbiddenException(
        `Etape with the same name and dates already exists for this sujet`,
      );
    }
    const createdEtape = await this.prisma.etape.create({
      data: {
        nom: etapeNom,
        dateDebut: new Date(etape.dateDebut),
        dateFin: new Date(etape.dateFin),
        idS,
      },
    });

    if (taches && taches.length > 0) {
      await Promise.all(
        taches.map(
          (tache: { tache: string; dateDebut: string; dateFin: string }) => {
            const nomTache = TacheNom[tache.tache as keyof typeof TacheNom];
            if (!nomTache) {
              throw new ForbiddenException(
                `Invalid Tache value: ${tache.tache}`,
              );
            }

            return this.prisma.tâches.create({
              data: {
                nom: nomTache,
                dateDebut: new Date(tache.dateDebut),
                dateFin: new Date(tache.dateFin),
                idEtape: createdEtape.idEtape,
              },
            });
          },
        ),
      );
    }

    return createdEtape;
  }

  async getAllDates() {
    const dates = await this.prisma.datePresence.findMany({
      select: {
        idDP: true,
        date: true,
      },
    });
    if (!dates || dates.length === 0)
      throw new ForbiddenException('Cannot find any date');
    return dates.map((date) => ({
      idDP: date.idDP,
      date: new Date(date.date).toISOString().split('T')[0], // Format YYYY-MM-DD
    }));
  }
  async getAllEtudiantOfGroupe(idG: number) {
    const groupe = await this.prisma.groupe.findUnique({
      where: { idG },
    });

    if (!groupe) throw new Error('No group found');

    const binomes = await this.prisma.binome.findMany({
      where: { idG: groupe.idG },
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
            presences: {
              select: {
                idDP: true,
                etat: true,
              },
            },
          },
        },
      },
    });

    if (!binomes || binomes.length === 0) throw new Error('No binomes found');

    const etudiants = binomes.flatMap((binome) =>
      binome.etudiant.map((etu) => ({
        idU: etu.idU,
        fullName: `${etu.user.nom} ${etu.user.prenom}`,
        presences: etu.presences,
      })),
    );

    return etudiants;
  }
  async setAbasenceEtudiant(idU: number, idDP: number, etat: string) {
    if (!['Absent', 'Present'].includes(etat)) {
      throw new Error("Valeur de l'état non valide");
    }

    const etatPresence: EtatPresence = etat as EtatPresence;

    try {
      await this.prisma.presence.upsert({
        where: {
          etudiantId_idDP: {
            etudiantId: idU,
            idDP: idDP,
          },
        },
        update: {
          etat: etatPresence, // تحديث الحضور/الغياب
        },
        create: {
          idDP: idDP,
          etudiantId: idU,
          etat: etatPresence || 'Absent', // تعيين قيمة افتراضية "Absent" إذا كانت القيمة فارغة
        },
      });
      return { message: 'update precence' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence :', error);
      throw new Error('Impossible de mettre à jour la présence');
    }
  }

  async getAllStudent() {
    return await this.prisma.etudiant.findMany({
      select: {
        idU: true,
        presences: {
          select: {
            idDP: true,
          },
        },
      },
    });
  }
  async getAllEtapesOfGroupe(idG: number) {
    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG,
      },
      select: {
        idS: true,
      },
    });
    if (!groupe) throw new ForbiddenException('cannot found any groupe');
    if (groupe.idS === null)
      throw new ForbiddenException('cannot found any groupe');
    return await this.prisma.etape.findMany({
      where: {
        idS: groupe.idS,
      },
      select: {
        idEtape: true,
        nom: true,
      },
    });
  }

  async getAllTacheOfEtapeByBinome(idB: number, idEtape: number) {
    const taches = await this.prisma.tâches.findMany({
      where: {
        idEtape: idEtape,
        idR: {
          not: null,
        },
        rapportTâches: {
          is: {
            rapport: {
              is: {
                idB: idB,
              },
            },
          },
        },
      },
      select: {
        nom: true,
        idR: true,
        dateFin: true,
      },
    });

    if (taches.length === 0) {
      throw new ForbiddenException(
        'No tasks found for this binome in this step',
      );
    }

    const results = await Promise.all(
      taches.map(async (item) => {
        const statutRapport = await this.prisma.evaluationRaport.findFirst({
          where: {
            idR: item.idR as number,
          },
        });
        const lastVersion = await this.prisma.versionRapport.findFirst({
          where: { idR: item.idR as number },
          orderBy: { updatedAt: 'desc' },
          select: {
            description: true,
            lien: true,
            updatedAt: true,
            rapport: {
              select: {
                titre: true,
              },
            },
          },
        });

        return {
          idR: item.idR,
          tacheNom: item.nom,
          dateFin: item.dateFin,
          rapport: lastVersion?.rapport?.titre,
          versionDescription: lastVersion?.description,
          lien: lastVersion?.lien,
          updatedAt: lastVersion?.updatedAt,
          statut: statutRapport?.statut ?? ' Rejeté',
        };
      }),
    );

    return results;
  }

  async updateEvaluationRapport(idR: number, statutStr: string) {
    const statut: EtatRapport = statutStr as EtatRapport;

    const existing = await this.prisma.evaluationRaport.findFirst({
      where: { idR: idR },
    });

    if (existing) {
      return await this.prisma.evaluationRaport.update({
        where: { idER: existing.idER },
        data: { statut },
      });
    } else {
      return await this.prisma.evaluationRaport.create({
        data: {
          statut,
          idR,
        },
      });
    }
  }

  async createOrUpdateNoteEtapes(
    idB: number,
    idEtape: number,
    noteValue: number,
  ) {
    const existing = await this.prisma.note.findFirst({
      where: {
        idB,
        idEtape,
      },
    });

    if (existing) {
      return await this.prisma.note.update({
        where: {
          idEtape_idB: {
            idEtape,
            idB,
          },
        },
        data: { note: noteValue },
      });
    } else {
      return await this.prisma.note.create({
        data: {
          idB,
          idEtape,
          note: noteValue,
        },
      });
    }
  }
  async setOrUpdateNoteFinal(idU: number, noteFinal: number) {
    const etudiant = await this.prisma.etudiant.findUnique({
      where: { idU },
    });

    if (!etudiant) {
      throw new NotFoundException(`Etudiant with id ${idU} not found`);
    }

    const updatedEtudiant = await this.prisma.etudiant.update({
      where: { idU },
      data: {
        noteFinal: noteFinal,
      },
    });

    return {
      message: `Note final ${etudiant.noteFinal === null ? 'set' : 'updated'} successfully.`,
      noteFinal: updatedEtudiant.noteFinal,
    };
  }
}
