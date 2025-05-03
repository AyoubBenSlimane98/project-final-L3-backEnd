import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AdminSignupDto,
  AdminAnnonce,
  AdminInfoProfil,
  AdminPasswordDto,
} from './dto';
import { generateOTP } from 'src/util';
import { EncryptionService } from 'src/encryption/encryption.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getAllUsers() {
    const allusers = await this.prisma.compte.findMany({
      relationLoadStrategy: 'join',
      select: {
        email: true,
        user: {
          select: {
            nom: true,
            prenom: true,
            etudiant: true,
            enseignant: true,
            admin: true,
          },
        },
      },
    });

    if (!allusers || allusers.length === 0) {
      throw new NotFoundException('No users found');
    }

    const formattedUsers = allusers.map((user) => {
      let role: 'etudiant' | 'enseignant' | 'admin' | null = null;

      if (user.user?.etudiant) {
        role = 'etudiant';
      } else if (user.user?.enseignant) {
        role = 'enseignant';
      } else if (user.user?.admin) {
        role = 'admin';
      }

      return {
        email: user.email,
        nom: user.user?.nom ?? null,
        prenom: user.user?.prenom ?? null,
        role: role,
      };
    });

    // Filter out users with the 'admin' role
    const nonAdminUsers = formattedUsers.filter(
      (user) => user.role !== 'admin',
    );

    return nonAdminUsers;
  }

  // async deleteUser(email: string) {
  //   const compte = await this.prisma.compte.findUnique({
  //     where: { email },
  //   });

  //   if (!compte) {
  //     throw new NotFoundException('Compte not found');
  //   }

  //   const user = await this.prisma.utilisateur.findUnique({
  //     where: { idC: compte.idC },
  //     select: {
  //       idU: true,
  //       etudiant: true,
  //       enseignant: true,
  //     },
  //   });

  //   if (!user) throw new NotFoundException('Utilisateur not found');
  //   await this.prisma.compte.delete({ where: { email } });
  //   await this.prisma.utilisateur.delete({ where: { idU: user.idU } });
  //   // if (user?.etudiant) {
  //   //   await this.prisma.etudiant.delete({
  //   //     where: { userId: user.etudiant.userId },
  //   //   });
  //   // }

  //   // if (user?.enseignant) {
  //   //   await this.prisma.enseignantPrincipal.delete({
  //   //     where: { enseignantId: user?.enseignant.userId },
  //   //   });
  //   //   await this.prisma.enseignant.delete({
  //   //     where: { userId: user.enseignant.userId },
  //   //   });
  //   // }

  //   // await this.prisma.utilisateur.delete({
  //   //   where: { id: user?.id },
  //   // });

  //   // await this.prisma.compte.delete({
  //   //   where: { id: compte.id },
  //   // });

  //   return { message: 'User and related records deleted successfully' };
  // }
  async deleteUser(email: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { email },
    });

    if (!compte) {
      throw new NotFoundException('Compte not found');
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { idC: compte.idC },
      select: {
        idU: true,
        etudiant: true,
        enseignant: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur not found');

    // Delete related student data if user is a student
    if (user?.etudiant) {
      await this.prisma.etudiant.delete({
        where: { idU: user.idU },
      });
    }

    // Delete related teacher data if user is a teacher
    if (user?.enseignant) {
      await this.prisma.enseignantPrincipal.delete({
        where: { idU: user.idU },
      });
      await this.prisma.enseignant.delete({
        where: { idU: user.idU },
      });
    }

    // Finally delete the user and account
    await this.prisma.utilisateur.delete({
      where: { idU: user.idU },
    });

    await this.prisma.compte.delete({
      where: { email },
    });
    return {
      messsage: 'deleted sucess',
    };
  }

  async getAdmin(sub: number) {
    const existentAdmin = await this.prisma.compte.findUnique({
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
    if (!existentAdmin) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    return existentAdmin;
  }

  async getProfileById(idU: number) {
    return await this.prisma.utilisateur.findUnique({
      where: { idU: idU },
      select: {
        bio: true,
        image: true,
      },
    });
  }
  async getProfile(sub: number) {
    const existentCompte = await this.prisma.compte.findUnique({
      where: { idC: sub },
      select: {
        user: true,
      },
    });
    if (!existentCompte) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    return await this.prisma.utilisateur.findUnique({
      where: { idU: existentCompte.user?.idU },
      select: {
        bio: true,
        image: true,
      },
    });
  }

  async getAllAnnounces(sub: number) {
    const admin = await this.prisma.compte.findUnique({
      where: {
        idC: sub,
      },
      include: {
        user: true,
      },
    });
    if (!admin) throw new ForbiddenException('you can not get all annonces!');

    const annoces = await this.prisma.administrateur.findUnique({
      where: { idU: admin.user?.idU },
      omit: { idU: true },
      include: {
        annonces: {
          omit: {
            idU: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    if (!annoces) {
      throw new BadRequestException('not exist any annonce for this admin');
    }
    return annoces;
  }

  async createAccount(adminSignupDto: AdminSignupDto) {
    const otp = generateOTP();
    const { email, password, nom, prenom, sexe, dateNaissance } =
      adminSignupDto;

    const existentCompte = await this.prisma.compte.findUnique({
      where: { email },
    });

    if (existentCompte) {
      throw new ConflictException('Email already exists');
    }

    const catNom = nom.slice(0, 3);

    const defaultBio = `@${prenom}_${catNom}_${otp.slice(0, 3)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const newCompte = await tx.compte.create({
        data: {
          email,
          password: await this.encryptionService.hashPassword(password),
        },
      });
      const tokens = await this.tokenService.getTokens(
        newCompte.idC,
        newCompte.email,
      );
      await tx.token.create({
        data: {
          accessToken: tokens.accessToken,
          refreshtoken: await this.encryptionService.hashPassword(
            tokens.refreshtoken,
          ),
          compteId: newCompte.idC,
        },
      });
      const newUser = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          sexe,
          bio: defaultBio,
          dateNaissance,
          idC: newCompte.idC,
        },
      });

      await tx.administrateur.create({
        data: {
          idU: newUser.idU,
        },
      });
      return {
        message: 'Admin created successfully',
        tokens,
      };
    });
    return result;
  }

  async createAnnonce(adminAnnonce: AdminAnnonce, sub: number) {
    const { titre, description, image } = adminAnnonce;
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        idC: sub,
      },
    });
    if (!user)
      throw new UnauthorizedException('you can not created this annonce');
    const existentAdmin = await this.prisma.administrateur.findUnique({
      where: { idU: user.idU },
    });
    if (!existentAdmin) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    await this.prisma.annonce.create({
      data: {
        titre,
        description,
        image,
        idU: existentAdmin.idU,
      },
    });
    return {
      created: true,
      message: 'created new Annonce successful!',
    };
  }

  async deleteAnnonce(sub: number, id: number) {
    const existentUser = await this.prisma.utilisateur.findUnique({
      where: {
        idC: sub,
      },
      select: {
        admin: {
          select: {
            idU: true,
          },
        },
      },
    });
    if (!existentUser) {
      throw new UnauthorizedException('can not make this operation');
    }

    const existAnnoce = await this.prisma.annonce.findMany({
      where: {
        idA: id,
        idU: existentUser.admin?.idU,
      },
    });
    if (!existAnnoce) throw new ForbiddenException('can not deleted this post');
    await this.prisma.annonce.delete({
      where: {
        idA: id,
      },
    });
    return {
      message: 'Annoces is Deleted succesfull!',
    };
  }

  async updateAnnonce(sub: number, id: number, adminAnnonce: AdminAnnonce) {
    const existentUser = await this.prisma.utilisateur.findUnique({
      where: {
        idC: sub,
      },
      select: {
        admin: {
          select: {
            idU: true,
          },
        },
      },
    });
    if (!existentUser) {
      throw new UnauthorizedException('can not make this operation');
    }

    const existAnnoce = await this.prisma.annonce.findMany({
      where: {
        idA: id,
        idU: existentUser.admin?.idU,
      },
    });
    if (!existAnnoce) throw new ForbiddenException('can not deleted this post');
    await this.prisma.annonce.update({
      where: {
        idA: id,
      },
      data: {
        ...adminAnnonce,
      },
    });
    return {
      message: 'Annoces is Deleted succesfull!',
    };
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

  async updateInfoProfile(sub: number, adminInfoProfil: AdminInfoProfil) {
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
        ...adminInfoProfil,
      },
    });
    return {
      message: 'info profil change',
    };
  }

  async updatepasswordProfile(sub: number, adminPasswordDto: AdminPasswordDto) {
    const { newPassword, oldPassword } = adminPasswordDto;
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
}
