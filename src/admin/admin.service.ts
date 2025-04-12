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
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

  async deleteUser(email: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!compte) {
      throw new NotFoundException('Compte not found');
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { compteId: compte.id },
      select: {
        id: true,
        etudiant: true,
        enseignant: true,
      },
    });

    if (user?.etudiant) {
      await this.prisma.etudiant.delete({
        where: { userId: user.etudiant.userId },
      });
    }

    if (user?.enseignant) {
      await this.prisma.enseignantPrincipal.delete({
        where: { enseignantId: user?.enseignant.id },
      });
      await this.prisma.enseignant.delete({
        where: { userId: user.enseignant.userId },
      });
    }

    await this.prisma.utilisateur.delete({
      where: { id: user?.id },
    });

    await this.prisma.compte.delete({
      where: { id: compte.id },
    });

    return { message: 'User and related records deleted successfully' };
  }

  async getAdmin(sub: number) {
    const existentAdmin = await this.prisma.compte.findUnique({
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
    if (!existentAdmin) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    return existentAdmin;
  }
  async getProfile(sub: number) {
    const existentCompte = await this.prisma.compte.findUnique({
      where: { id: sub },
      select: {
        user: true,
      },
    });
    if (!existentCompte) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    return await this.prisma.utilisateur.findUnique({
      where: { id: existentCompte.user?.id },
      select: {
        bio: true,
        image: true,
      },
    });
  }
  async getAllAnnounces(sub: number) {
    const admin = await this.prisma.compte.findUnique({
      where: {
        id: sub,
      },
      include: {
        user: true,
      },
    });
    if (!admin) throw new ForbiddenException('you can not get all annonces!');

    const annoces = await this.prisma.administrateur.findUnique({
      where: { userId: admin.user?.id },
      omit: { id: true, userId: true },
      include: {
        annonces: {
          omit: {
            adminId: true,
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
    const defaultImageUrl =
      'https://scontent.fczl2-2.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s480x480&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeF_OWSBlL4_ahZGK8uktg7YWt9TLzuBU1Ba31MvO4FTUAcNr-rcAk0Q6wgee_n1MVfJVXKEYXEpVc_A8npzsuDs&_nc_ohc=pCF_EXqQ5MYQ7kNvwGqbQH8&_nc_oc=AdmOQDv_qA9yPoDAQK2j4m8cM77HYt2osPaGYZiWQNIR41-_Kkg1lN_m_n79WacUl90&_nc_zt=24&_nc_ht=scontent.fczl2-2.fna&oh=00_AfEfE4VyUFM1gD2VkajBmRMamhtVSp2NpcihUNDqLsAtzg&oe=681B903A';
    const defaultBio = `@${prenom}_${catNom}_${otp.slice(0, 3)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const newCompte = await tx.compte.create({
        data: {
          email,
          password: await this.hashPassword(password),
        },
      });
      const tokens = await this.getTokens(newCompte.id, newCompte.email);
      await tx.token.create({
        data: {
          accessToken: tokens.accessToken,
          refreshtoken: await this.hashPassword(tokens.refreshtoken),
          compteId: newCompte.id,
        },
      });
      const newUser = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          sexe,
          image: defaultImageUrl,
          bio: defaultBio,
          dateNaissance,
          compteId: newCompte.id,
        },
      });

      await tx.administrateur.create({
        data: {
          userId: newUser.id,
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
    const existentAdmin = await this.prisma.administrateur.findUnique({
      where: { userId: sub },
    });
    if (!existentAdmin) {
      throw new UnauthorizedException('you can not created this annonce');
    }
    await this.prisma.annonce.create({
      data: {
        titre,
        description,
        image,
        adminId: existentAdmin.id,
      },
    });
    return {
      created: true,
      message: 'created new Annonce successful!',
    };
  }
  async getTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          expiresIn: '15m',
          secret: process.env.JWT_AT_SECRET,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          expiresIn: '30d',
          secret: process.env.JWT_RT_SECRET,
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshtoken: rt,
    };
  }
  async deleteAnnonce(sub: number, id: number) {
    const existentUser = await this.prisma.utilisateur.findUnique({
      where: {
        compteId: sub,
      },
      select: {
        admin: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!existentUser) {
      throw new UnauthorizedException('can not make this operation');
    }

    const existAnnoce = await this.prisma.annonce.findMany({
      where: {
        id,
        adminId: existentUser.admin?.userId,
      },
    });
    if (!existAnnoce) throw new ForbiddenException('can not deleted this post');
    await this.prisma.annonce.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Annoces is Deleted succesfull!',
    };
  }
  async updateAnnonce(sub: number, id: number, adminAnnonce: AdminAnnonce) {
    const existentUser = await this.prisma.utilisateur.findUnique({
      where: {
        compteId: sub,
      },
      select: {
        admin: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!existentUser) {
      throw new UnauthorizedException('can not make this operation');
    }

    const existAnnoce = await this.prisma.annonce.findMany({
      where: {
        id,
        adminId: existentUser.admin?.userId,
      },
    });
    if (!existAnnoce) throw new ForbiddenException('can not deleted this post');
    await this.prisma.annonce.update({
      where: {
        id,
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
  async updateInfoProfile(sub: number, adminInfoProfil: AdminInfoProfil) {
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
