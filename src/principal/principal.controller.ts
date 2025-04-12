import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { CompteID, Public } from 'src/authentication/common/decorators';
import { PrincipalInfoProfil, PrincipalPasswordDto, UserDto } from './dto';

@Controller('principal')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}
  @Get('profil')
  async getPrincipal(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.principalService.getPrincipal(sub);
  }
  @Public()
  @Get('groupe')
  async getNumberGroupes() {
    return await this.principalService.getNumberGroupes();
  }
  @Public()
  @Get('groupe/:id')
  async getGroupe(@Param('id', ParseIntPipe) id: number) {
    return await this.principalService.getGroupe(id);
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
  @Post('create-groupe/:id')
  async createAllUserOfProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() userDto: UserDto,
  ) {
    return await this.principalService.createAllUserOfProject(
      id,
      userDto.users,
    );
  }
}
