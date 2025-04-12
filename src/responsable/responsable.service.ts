import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSujetDto } from './dto';

@Injectable()
export class ResponsableService {
  constructor(private readonly prisma: PrismaService) {}
  async createSujet(sub: number, createSujetDto: CreateSujetDto) {
    const { titre, description, references, prerequises } = createSujetDto;

    const foundCompte = await this.prisma.compte.findUnique({
      where: { id: sub },
    });
    if (!foundCompte) {
      throw new NotFoundException('Cannot find any compte');
    }

    const foundEnsignantRes = await this.prisma.utilisateur.findUnique({
      where: {
        compteId: foundCompte.id,
      },
      select: {
        enseignant: {
          select: {
            id: true,
            responsable: true,
          },
        },
      },
    });

    if (!foundEnsignantRes || !foundEnsignantRes.enseignant) {
      throw new NotFoundException('Cannot find any enseignant responsable');
    }
    const enseignantId = foundEnsignantRes.enseignant.id;
    const result = await this.prisma.$transaction(async (tx) => {
      const sujet = await tx.sujet.create({
        data: {
          titre,
          description,
          enseignantId,
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
                sujetId: sujet.id,
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
                sujetId: sujet.id,
              },
            }),
          ),
        );
      }

      return sujet;
    });

    return { message: 'decription of sujt is created successfuly!', result };
  }
}
