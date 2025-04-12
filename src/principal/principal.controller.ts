import { Body, Controller, Get, ParseIntPipe, Put } from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { CompteID } from 'src/authentication/common/decorators';
import { PrincipalInfoProfil, PrincipalPasswordDto } from './dto';

@Controller('principal')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}
  @Get('profil')
  async getPrincipal(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.principalService.getPrincipal(sub);
  }
  @Put('profil/img')
  async updateImageProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body('image') image: string,
  ) {
    return await this.principalService.updateImageProfile(sub, image);
  }
  @Put('profil/info')
  async updateInfoProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() principalInfoProfil: PrincipalInfoProfil,
  ) {
    return await this.principalService.updateInfoProfile(
      sub,
      principalInfoProfil,
    );
  }
  @Put('profil/password')
  async updatepasswordProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() principalPasswordDto: PrincipalPasswordDto,
  ) {
    return await this.principalService.updatepasswordProfile(
      sub,
      principalPasswordDto,
    );
  }
}
