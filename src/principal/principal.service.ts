import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrincipalInfoProfil, PrincipalPasswordDto } from './dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}
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
