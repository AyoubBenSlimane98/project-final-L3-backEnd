import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}
  // async refreshToken(sub: number, refreshtoken: string) {
  //   const compte = await this.prisma.compte.findUnique({
  //     where: { idC: sub },
  //   });
  //   if (!compte) {
  //     throw new ForbiddenException('Compte not found');
  //   }
  //   const rt = await this.prisma.token.findUnique({
  //     where: { compteId: compte.idC },
  //   });
  //   if (!rt) {
  //     throw new ForbiddenException('Refresh token not found');
  //   }
  //   const isRefreshTokenValid = await this.encryptionService.comparePasswords(
  //     refreshtoken,
  //     rt.refreshtoken,
  //   );
  //   if (!isRefreshTokenValid) {
  //     throw new ForbiddenException('Refresh token not valid');
  //   }
  //   const tokens = await this.getTokens(compte.idC, compte.email);
  //   await this.prisma.token.update({
  //     where: { compteId: compte.idC },
  //     data: {
  //       accessToken: tokens.accessToken,
  //       refreshtoken: await this.encryptionService.hashPassword(
  //         tokens.refreshtoken,
  //       ),
  //     },
  //   });
  //   return { message: 'Refresh token successful', tokens };
  // }

  async getTokens(userId: number, email: string) {
    const userIdAsString = String(userId);

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userIdAsString, email },
        {
          expiresIn: '15m',
          secret: process.env.JWT_AT_SECRET,
        },
      ),
      this.jwtService.signAsync(
        { sub: userIdAsString, email },
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
}
