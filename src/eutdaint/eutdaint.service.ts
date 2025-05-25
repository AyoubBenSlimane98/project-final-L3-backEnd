import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEtapeDto,
  CreateFeedbackDto,
  CreateRapportMemoireDto,
  CreateTacheDto,
  QuestionDto,
} from './dto';
import { EtapeNom } from '@prisma/client';

@Injectable()
export class EutdaintService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAnnoces() {
    const annoces = await this.prisma.annonce.findMany();
    if (annoces.length == 0)
      throw new NotFoundException('cannot found any annoces');
    return annoces;
  }

  async getResponsableofGroupe(sub: number) {
    const compte = await this.prisma.compte.findUnique({ where: { idC: sub } });
    if (!compte) throw new ForbiddenException('Cannot find Compte');

    const user = await this.prisma.utilisateur.findUnique({
      where: { idC: compte.idC },
    });
    if (!user) throw new ForbiddenException('Cannot find Utilisateur');

    const etudiant = await this.prisma.etudiant.findUnique({
      where: { idU: user.idU },
      select: { idB: true },
    });
    if (!etudiant?.idB) {
      throw new ForbiddenException('Student is not assigned to a Binome');
    }

    const binome = await this.prisma.binome.findUnique({
      where: { idB: etudiant.idB },
      select: { idG: true },
    });
    if (!binome) throw new ForbiddenException('Cannot find Binome');

    const groupe = await this.prisma.groupe.findUnique({
      where: { idG: binome.idG },
      select: { enseignantRId: true },
    });
    if (!groupe) throw new ForbiddenException('Cannot find Groupe');

    return {
      etudiantId: user.idU,
      enseignantRId: groupe.enseignantRId,
    };
  }

  async getSujetofGroupe(sub: number) {
    const compte = await this.prisma.compte.findUnique({ where: { idC: sub } });
    if (!compte) throw new ForbiddenException('cannot found account');
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        idC: compte.idC,
      },
    });
    if (!user) throw new ForbiddenException('cannot found account');
    const etudaint = await this.prisma.etudiant.findUnique({
      where: {
        idU: user.idU,
      },
      select: {
        idB: true,
      },
    });
    if (!etudaint || etudaint.idB === null)
      throw new ForbiddenException('Student has no Binome');
    const binome = await this.prisma.binome.findUnique({
      where: {
        idB: etudaint.idB,
      },
      select: {
        idG: true,
      },
    });

    if (!binome) throw new ForbiddenException('cannot found account');
    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG: binome.idG,
      },
      select: {
        idS: true,
      },
    });
    if (!groupe) throw new ForbiddenException('cannot found account');
    if (groupe.idS === null) throw new ForbiddenException('cannot found sujet');
    const sujet = await this.prisma.sujet.findUnique({
      where: {
        idS: groupe.idS,
      },
      select: {
        titre: true,
        description: true,
        reference: {
          select: {
            reference: true,
          },
        },
        prerequis: {
          select: {
            prerequis: true,
          },
        },
      },
    });
    if (!sujet) throw new ForbiddenException('cannot found sujet');
    return sujet;
  }
  async createQuestion(questionDto: QuestionDto) {
    console.log(questionDto);
    const { question, enseignantRId, etudiantId } = questionDto;

    await this.prisma.question.create({
      data: {
        question,
        enseignantRId,
        etudiantId,
      },
    });
    return {
      message: 'question sent to responsable',
    };
  }

  async getAllQuestion() {
    const etudiantQ = await this.prisma.etudiant.findMany({
      select: {
        idU: true,
        user: {
          select: {
            image: true,
            bio: true,
          },
        },
        Question: true,
      },
    });
    if (!etudiantQ) throw new ForbiddenException('cannot find any Qeustions');
    return etudiantQ;
  }

  async getBinomeData(idB: number) {
    const etudiants = await this.prisma.etudiant.findMany({
      where: { idB },
      select: {
        idB: true,
        user: {
          select: {
            bio: true,
            image: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!etudiants || etudiants.length === 0) {
      throw new ForbiddenException('Cannot find any étudiants');
    }

    const data = etudiants.map((etu) => ({
      idB: etu.idB,
      bio: etu.user.bio,
      image: etu.user.image,
      fullName: `${etu.user.nom} ${etu.user.prenom}`,
    }));

    return data;
  }

  async getAllCas(idG: number) {
    const groupe = await this.prisma.groupe.findUnique({
      where: { idG },
      select: { idS: true },
    });

    if (!groupe) {
      throw new ForbiddenException('Cannot find any group');
    }

    if (groupe.idS === null || groupe.idS === undefined) {
      throw new ForbiddenException('Group is not linked to any subject (idS)');
    }

    const casList = await this.prisma.cas.findMany({
      where: {
        idS: groupe.idS,
      },
      select: {
        idCas: true,
        acteur: true,
        cas: true,
      },
    });

    if (casList.length === 0) {
      throw new ForbiddenException('No cas found for this group');
    }

    return casList;
  }

  async getAllCasOfBinome(idB: number) {
    const casList = await this.prisma.cas.findMany({
      where: { idB },
      select: {
        idCas: true,
        acteur: true,
        cas: true,
      },
    });

    if (!casList || casList.length === 0) {
      throw new ForbiddenException('No cas found for this binome');
    }

    return casList;
  }

  async getEtapeOfResbonsablite(idS: number, etape: string) {
    const etapes = await this.prisma.etape.findMany({
      where: {
        idS,
        nom: etape as EtapeNom,
      },
    });
    if (etape.length === 0) throw new Error('etape not valid');
    return etapes[0].idEtape;
  }
  async getInfoEtudiant(sub: number) {
    const userEtu = await this.prisma.utilisateur.findUnique({
      where: { idC: sub },
    });

    if (!userEtu) {
      throw new ForbiddenException('Cannot find compte');
    }

    const etu = await this.prisma.etudiant.findUnique({
      where: { idU: userEtu.idU },
    });

    if (!etu) {
      throw new ForbiddenException('Cannot find etudiant');
    }

    if (etu.idB === null || etu.idB === undefined) {
      throw new ForbiddenException('Etudiant is not assigned to any binome');
    }

    const binome = await this.prisma.binome.findUnique({
      where: { idB: etu.idB },
      select: {
        idB: true,
        responsabilite: true,
        idG: true,
      },
    });

    if (!binome) {
      throw new ForbiddenException('Cannot find binome');
    }
    const groupe = await this.prisma.groupe.findUnique({
      where: {
        idG: binome.idG,
      },
    });
    if (!groupe) {
      throw new ForbiddenException('Cannot find groupe');
    }
    let etapeNom = '';
    switch (binome.responsabilite) {
      case 'chapter_1':
        etapeNom = 'Analyse';
        break;

      case 'chapter_2':
        etapeNom = 'Conception';
        break;
      case 'chapter_3':
        etapeNom = 'Developpement';
        break;
      default:
        break;
    }
    if (groupe.idS === null || groupe.idS === undefined) {
      throw new ForbiddenException('Groupe is not linked to any subject (idS)');
    }
    if (
      etapeNom === 'Analyse' ||
      etapeNom === 'Developpement' ||
      etapeNom === 'Conception'
    ) {
      const result = await this.getEtapeOfResbonsablite(groupe.idS, etapeNom);
      return {
        idB: binome.idB,
        idEtape: result,
        responsabilite: binome.responsabilite,
        idG: binome.idG,
      };
    }
    return {
      idB: binome.idB,
      responsabilite: binome.responsabilite,
      idG: binome.idG,
    };
  }

  async createRapport(createTacheDto: CreateTacheDto) {
    const { idB, description, titre, rapportUrl, tache } = createTacheDto;

    const binomes = await this.prisma.binome.findUnique({
      where: { idB },
    });

    if (!binomes) {
      throw new ForbiddenException('Cannot find binôme');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const rapport = await tx.rapport.create({
          data: {
            titre,
            idB,
          },
        });

        await tx.versionRapport.create({
          data: {
            description,
            lien: rapportUrl,
            idR: rapport.idR,
          },
        });

        await tx.rapportTâches.create({
          data: {
            idR: rapport.idR,
          },
        });

        const tacheData = await tx.tâches.findFirst({
          where: {
            nom: String(tache),
          },
        });

        if (!tacheData) {
          throw new NotFoundException('Tâche not found');
        }

        await tx.tâches.update({
          where: {
            idTache: tacheData.idTache,
          },
          data: {
            idR: rapport.idR,
          },
        });

        return rapport;
      });

      return result;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ForbiddenException('Transaction failed: ' + errorMessage);
    }
  }

  async getNoteEtapEtudiant(idU: number) {
    const etu = await this.prisma.etudiant.findUnique({
      where: { idU },
    });

    if (!etu) {
      throw new ForbiddenException('User does not exist');
    }

    const binomeNote = await this.prisma.binome.findUnique({
      where: { idB: etu.idB as number },
      select: {
        note: true,
      },
    });

    if (!binomeNote) {
      throw new ForbiddenException('Note of binome does not exist');
    }

    const notesWithEtapeNames = await Promise.all(
      binomeNote.note.map(async (item) => {
        const etape = await this.prisma.etape.findUnique({
          where: { idEtape: item.idEtape },
          select: { nom: true },
        });

        return {
          nomEtape: etape?.nom ?? 'Inconnu',
          note: item.note,
        };
      }),
    );

    return notesWithEtapeNames;
  }
  async createRapportEtape(createEtapeDto: CreateEtapeDto) {
    const { idB, idEtape, description, titre, rapportUrl } = createEtapeDto;

    const binomes = await this.prisma.binome.findUnique({
      where: { idB },
    });

    if (!binomes) {
      throw new ForbiddenException('Cannot find binôme');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const rapport = await tx.rapport.create({
          data: {
            titre,
            idB,
          },
        });

        await tx.versionRapport.create({
          data: {
            description,
            lien: rapportUrl,
            idR: rapport.idR,
          },
        });

        await tx.rapportEtape.create({
          data: {
            idR: rapport.idR,
          },
        });

        const etapeExist = await tx.etape.findUnique({
          where: {
            idEtape,
          },
        });

        if (!etapeExist) {
          throw new NotFoundException('Etape not found');
        }

        await tx.etape.update({
          where: {
            idEtape: etapeExist.idEtape,
          },
          data: {
            idR: rapport.idR,
          },
        });

        return {
          type: 'success',
        };
      });

      return result;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ForbiddenException('Transaction failed: ' + errorMessage);
    }
  }
  async createRapportMemoier(createTacheDto: CreateRapportMemoireDto) {
    const { idB, description, titre, rapportUrl } = createTacheDto;

    const binomes = await this.prisma.binome.findUnique({
      where: { idB },
    });

    if (!binomes) {
      throw new ForbiddenException('Cannot find binôme');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const rapport = await tx.rapport.create({
          data: {
            titre,
            idB,
          },
        });

        await tx.versionRapport.create({
          data: {
            description,
            lien: rapportUrl,
            idR: rapport.idR,
          },
        });

        await tx.rapportFinal.create({
          data: {
            idR: rapport.idR,
          },
        });

        return { type: 'succes', rapport };
      });

      return result;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ForbiddenException('Transaction failed: ' + errorMessage);
    }
  }

  async getSujectEtud(idG: number) {
    const groupes = await this.prisma.groupe.findUnique({
      where: {
        idG,
      },
    });

    if (!groupes) throw new Error('accoun groupe valid ');
    if (groupes.idS === null || groupes.idS === undefined) {
      throw new Error('Group is not linked to any subject (idS)');
    }
    return await this.getAllRapportChapiter(groupes.idS);
  }
  async getAllRapportChapiter(idS: number) {
    const chapters = await this.prisma.etape.findMany({
      where: {
        idS,
        idR: { not: null },
      },
    });

    if (chapters.length === 0) {
      throw new Error('No chapter has a report');
    }

    const results = await Promise.all(
      chapters.map(async (item) => {
        const raport = await this.prisma.versionRapport.findFirst({
          where: {
            idR: item.idR!,
          },
        });

        return {
          nom: item.nom,
          lien: raport?.lien ?? null,
        };
      }),
    );

    return results;
  }

  async createFeedBack(dto: CreateFeedbackDto) {
    const { responsabilite, idG, description } = dto;

    const binome = await this.prisma.binome.findFirst({
      where: {
        idG,
        responsabilite,
      },
    });

    if (!binome) {
      throw new Error(
        'Cannot find any binome with the specified responsabilité',
      );
    }

    await this.prisma.feedBack.create({
      data: {
        idB: binome.idB,
        description,
      },
    });
    return {
      message: 'feedback created',
    };
  }

  async allFeedBack(idB: number) {
    return await this.prisma.feedBack.findMany({
      where: {
        idB,
      },
    });
  }
  async deleteFeedBack(idF: number) {
    await this.prisma.feedBack.delete({
      where: {
        idF,
      },
    });
    return {
      message: 'succes ',
    };
  }
}
