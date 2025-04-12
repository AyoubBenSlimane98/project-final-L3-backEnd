import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthPasswod, AuthSigninDto, AuthSignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { generateOTP } from 'src/util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
          bio: defaultBio,
          dateNaissance,
          compteId: newCompte.id,
        },
      });

      const newEnseignant = await tx.enseignant.create({
        data: {
          userId: newUser.id,
        },
      });

      if (role === 'Responsable') {
        await tx.enseignantResponsable.create({
          data: {
            enseignantId: newEnseignant.id,
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
            enseignantId: newEnseignant.id,
          },
        });

        return {
          message: 'Principale created successfully',
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
      throw new ForbiddenException(' xxx Email or Password is not courrect');
    }
    const isPasswordCorrect = await this.comparePasswords(
      password,
      existentCompte.password,
    );
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Email or Password not courrect');
    }
    const tokens = await this.getTokens(
      existentCompte.id,
      existentCompte.email,
    );
    await this.prisma.token.upsert({
      where: { compteId: existentCompte.id },
      update: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.hashPassword(tokens.refreshtoken),
      },
      create: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.hashPassword(tokens.refreshtoken),
        compteId: existentCompte.id,
      },
    });
    const utilisateur = existentCompte.user;
    return {
      message: 'Login successful',
      token: tokens,
      role: utilisateur?.etudiant
        ? 'etudiant'
        : utilisateur?.enseignant?.responsable
          ? 'enseignant_responsable'
          : utilisateur?.enseignant?.principal
            ? 'enseignant_principal'
            : utilisateur?.admin
              ? 'admin'
              : 'unknown',
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
    const hash = await this.hashPassword(password);
    const tokens = await this.getTokens(
      existentCompte.id,
      existentCompte.email,
    );
    await this.prisma.token.upsert({
      where: { compteId: existentCompte.id },
      update: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.hashPassword(tokens.refreshtoken),
      },
      create: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.hashPassword(tokens.refreshtoken),
        compteId: existentCompte.id,
      },
    });
    await this.prisma.compte.update({
      where: { id: existentCompte.id },
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
    return {
      message: 'Login successful',
      token: tokens,
      role: utilisateur?.etudiant
        ? 'etudiant'
        : utilisateur?.enseignant?.responsable
          ? 'enseignant_responsable'
          : utilisateur?.enseignant?.principal
            ? 'enseignant_principal'
            : utilisateur?.admin
              ? 'admin'
              : 'unknown',
    };
  }

  async logout(sub: number) {
    const existentCompte = await this.prisma.compte.findUnique({
      where: { id: sub },
    });
    if (!existentCompte) {
      throw new ForbiddenException('Compte not found');
    }
    await this.prisma.token.delete({
      where: {
        compteId: existentCompte.id,
      },
    });
    return { message: 'Logout successful' };
  }
  async refreshToken(sub: number, refreshtoken: string) {
    const compte = await this.prisma.compte.findUnique({
      where: { id: sub },
    });
    if (!compte) {
      throw new ForbiddenException('Compte not found');
    }
    const rt = await this.prisma.token.findUnique({
      where: { compteId: compte.id },
    });
    if (!rt) {
      throw new ForbiddenException('Refresh token not found');
    }
    const isRefreshTokenValid = await this.comparePasswords(
      refreshtoken,
      rt.refreshtoken,
    );
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Refresh token not valid');
    }
    const tokens = await this.getTokens(compte.id, compte.email);
    await this.prisma.token.update({
      where: { compteId: compte.id },
      data: {
        accessToken: tokens.accessToken,
        refreshtoken: await this.hashPassword(tokens.refreshtoken),
      },
    });
    return { message: 'Refresh token successful', tokens };
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
