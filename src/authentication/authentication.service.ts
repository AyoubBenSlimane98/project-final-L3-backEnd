import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthPasswod, AuthSigninDto, AuthSignupDto } from './dto';
import { generateOTP } from 'src/util';
import { TokenService } from 'src/token/token.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async signUp(authSignupDto: AuthSignupDto) {
    const otp = generateOTP();
    const { email, password, nom, prenom, sexe, dateNaissance, role } =
      authSignupDto;

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
          image: 'uploads/1748017329549-user.jpg',
          bio: defaultBio,
          dateNaissance,
          idC: newCompte.idC,
        },
      });

      const newEnseignant = await tx.enseignant.create({
        data: {
          idU: newUser.idU,
        },
      });

      if (role === 'Responsable') {
        await tx.enseignantResponsable.create({
          data: {
            idU: newEnseignant.idU,
          },
        });

        return {
          message: 'Responsable created successfully',
          token: tokens,
        };
      }

      if (role === 'Principale') {
        await tx.enseignantPrincipal.create({
          data: {
            idU: newEnseignant.idU,
          },
        });

        return {
          message: 'Principale created successfully',
          token: tokens,
        };
      }
      if (role === 'Principale / Responsable') {
        await tx.enseignantPrincipal.create({
          data: {
            idU: newEnseignant.idU,
          },
        });
        await tx.enseignantResponsable.create({
          data: {
            idU: newEnseignant.idU,
          },
        });

        return {
          message: 'Both created successfully',
          token: tokens,
        };
      }
    });
    return result;
  }

  async signIn(authSigninDto: AuthSigninDto) {
    const { email, password } = authSigninDto;
    const existentCompte = await this.prisma.compte.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            etudiant: true,
            enseignant: {
              include: {
                principal: true,
                responsable: true,
              },
            },
            admin: true,
          },
        },
      },
    });
    if (!existentCompte) {
      throw new ForbiddenException('Email or Password is not courrect');
    }
    const isPasswordCorrect = await this.encryptionService.comparePasswords(
      password,
      existentCompte.password,
    );
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Email or Password not courrect');
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
    const utilisateur = existentCompte.user;
    let role = 'unknown';

    if (utilisateur?.etudiant) {
      role = 'etudiant';
    } else if (utilisateur?.enseignant?.principal) {
      role = 'enseignant_principal';
    } else if (utilisateur?.enseignant?.responsable) {
      role = 'enseignant_responsable';
    } else if (utilisateur?.admin) {
      role = 'admin';
    }

    return {
      message: 'Login successful',
      token: tokens,
      role,
    };
  }

  async changePassword(authPasswod: AuthPasswod) {
    const { email, password } = authPasswod;
    const existentCompte = await this.prisma.compte.findUnique({
      where: { email },
    });
    if (!existentCompte) {
      throw new ForbiddenException('Email or Password is not courrect');
    }
    const hash = await this.encryptionService.hashPassword(password);
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
    await this.prisma.compte.update({
      where: { idC: existentCompte.idC },
      data: {
        password: hash,
      },
    });
    const compte = await this.prisma.compte.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            etudiant: true,
            enseignant: {
              include: {
                principal: true,
                responsable: true,
              },
            },
            admin: true,
          },
        },
      },
    });
    const utilisateur = compte?.user;
    let role = 'unknown';

    if (utilisateur?.etudiant) {
      role = 'etudiant';
    } else if (utilisateur?.enseignant?.principal) {
      role = 'enseignant_principal';
    } else if (utilisateur?.enseignant?.responsable) {
      role = 'enseignant_responsable';
    } else if (utilisateur?.admin) {
      role = 'admin';
    }

    return {
      message: 'Login successful',
      token: tokens,
      role,
    };
  }

  async logout(sub: number) {
    const existentCompte = await this.prisma.compte.findUnique({
      where: { idC: sub },
    });
    if (!existentCompte) {
      throw new ForbiddenException('Compte not found');
    }
    await this.prisma.token.delete({
      where: {
        compteId: existentCompte.idC,
      },
    });
    return { message: 'Logout successful' };
  }
  async refreshToken(sub: number, refreshtoken: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { idC: sub },
    });
    if (!compte) {
      throw new ForbiddenException('Compte not found');
    }
    const rt = await this.prisma.token.findUnique({
      where: { compteId: compte.idC },
    });
    if (!rt) {
      throw new ForbiddenException('Refresh token not found');
    }
    const isRefreshTokenValid = await this.encryptionService.comparePasswords(
      refreshtoken,
      rt.refreshtoken,
    );
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Refresh token not valid');
    }
    const tokens = await this.tokenService.getTokens(compte.idC, compte.email);
    await this.prisma.token.update({
      where: { compteId: compte.idC },
      data: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.encryptionService.hashPassword(
          tokens.refreshtoken,
        ),
      },
    });
    return { message: 'Refresh token successful', tokens };
  }
}
