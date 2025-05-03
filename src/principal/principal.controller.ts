// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   ParseIntPipe,
//   Post,
//   Put,
// } from '@nestjs/common';
// import { PrincipalService } from './principal.service';
// import { CompteID } from 'src/authentication/common/decorators';
// import {
//   GroupeToSujetDto,
//   PrincipalInfoProfil,
//   PrincipalPasswordDto,
//   UpdateBinomeGroupDto,
//   UserDto,
// } from './dto';
// import { AuthSigninDto } from 'src/authentication/dto';

// @Controller('principal')
// export class PrincipalController {
//   constructor(private readonly principalService: PrincipalService) {}
//   @Get('profil')
//   async getPrincipal(@CompteID('sub', ParseIntPipe) sub: number) {
//     return await this.principalService.getPrincipal(sub);
//   }
//   @Get('switch-account')
//   async canSwitchAccount(@CompteID('sub', ParseIntPipe) sub: number) {
//     return this.principalService.canSwitchAccount(sub);
//   }
//   @Get('groupe')
//   async getNumberGroupes() {
//     return await this.principalService.getNumberGroupes();
//   }

//   @Get('groupe/all')
//   async getAllGroupes() {
//     return await this.principalService.getAllGroupes();
//   }

//   @Get('groupe/:id')
//   async getGroupe(@Param('id', ParseIntPipe) id: number) {
//     return await this.principalService.getGroupe(id);
//   }

//   @Get('all-groupes/:idG')
//   async newGetAllBinomesByGroupe(@Param('idG', ParseIntPipe) idG: number) {
//     return await this.principalService.newGetAllBinomesByGroupe(idG);
//   }
//   @Get('sujet-affecrer')
//   async getAllSujectAffecter() {
//     return await this.principalService.getAllSujectAffecter();
//   }

//   @Get('binome/:idB')
//   async getDataBinome(@Param('idB', ParseIntPipe) idB: number) {
//     return await this.principalService.getDataBinome(idB);
//   }

//   @Put('affect-sujet-group')
//   async setGroupeAndSujet(@Body() groupeToSujetDto: GroupeToSujetDto) {
//     return await this.principalService.setGroupeAndSujet(groupeToSujetDto);
//   }
//   @Put('profil/img')
//   async updateImageProfile(
//     @CompteID('sub', ParseIntPipe) sub: number,
//     @Body('image') image: string,
//   ) {
//     return await this.principalService.updateImageProfile(sub, image);
//   }
//   @Put('profil/info')
//   async updateInfoProfile(
//     @CompteID('sub', ParseIntPipe) sub: number,
//     @Body() principalInfoProfil: PrincipalInfoProfil,
//   ) {
//     return await this.principalService.updateInfoProfile(
//       sub,
//       principalInfoProfil,
//     );
//   }
//   @Put('profil/password')
//   async updatepasswordProfile(
//     @CompteID('sub', ParseIntPipe) sub: number,
//     @Body() principalPasswordDto: PrincipalPasswordDto,
//   ) {
//     return await this.principalService.updatepasswordProfile(
//       sub,
//       principalPasswordDto,
//     );
//   }

//   @Post('create-groupe/:id')
//   async createAllUserOfProject(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() userDto: UserDto,
//   ) {
//     return await this.principalService.createAllUserOfProject(
//       id,
//       userDto.users,
//     );
//   }
//   @Post('switch-account')
//   async switchAccount(@Body() authSigninDto: AuthSigninDto) {
//     return await this.principalService.switchAccount(authSigninDto);
//   }

//   @Post('update-groups')
//   updateStudentsGroups(@Body() updateBinomeGroupDto: UpdateBinomeGroupDto) {
//     return this.principalService.updateStudentsGroups(updateBinomeGroupDto);
//   }

//   @Delete('delete-students')
//   async unlinkStudentsFromBinome(@Body() body: { ids: number[] }) {
//     return await this.principalService.unlinkStudentsFromBinome(body.ids);
//   }
// }
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { CompteID } from 'src/authentication/common/decorators';
import {
  GroupeToSujetDto,
  PrincipalInfoProfil,
  PrincipalPasswordDto,
  UpdateBinomeGroupDto,
  UserDto,
} from './dto';
import { AuthSigninDto } from 'src/authentication/dto';

@Controller('principal')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  @Get('profil')
  async getPrincipal(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.principalService.getPrincipal(sub);
  }

  @Get('switch-account')
  async canSwitchAccount(@CompteID('sub', ParseIntPipe) sub: number) {
    return this.principalService.canSwitchAccount(sub);
  }

  @Get('groupe')
  async getNumberGroupes() {
    return await this.principalService.getNumberGroupes();
  }

  @Get('groupe/all')
  async getAllGroupes() {
    return await this.principalService.getAllGroupes();
  }

  @Get('groupe/:id')
  async getGroupe(@Param('id', ParseIntPipe) id: number) {
    return await this.principalService.getGroupe(id);
  }

  @Get('all-groupes/:idG')
  async newGetAllBinomesByGroupe(@Param('idG', ParseIntPipe) idG: number) {
    return await this.principalService.newGetAllBinomesByGroupe(idG);
  }

  @Get('sujet-affecrer')
  async getAllSujectAffecter() {
    return await this.principalService.getAllSujectAffecter();
  }

  @Get('binome/:idB')
  async getDataBinome(@Param('idB', ParseIntPipe) idB: number) {
    return await this.principalService.getDataBinome(idB);
  }

  @Put('affect-sujet-group')
  async setGroupeAndSujet(@Body() groupeToSujetDto: GroupeToSujetDto) {
    return await this.principalService.setGroupeAndSujet(groupeToSujetDto);
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

  @Post('switch-account')
  async switchAccount(@Body() authSigninDto: AuthSigninDto) {
    return await this.principalService.switchAccount(authSigninDto);
  }

  @Post('update-groups')
  updateStudentsGroups(@Body() updateBinomeGroupDto: UpdateBinomeGroupDto) {
    return this.principalService.updateStudentsGroups(updateBinomeGroupDto);
  }

  @Delete('delete-students')
  async unlinkStudentsFromBinome(@Body() body: { ids: number[] }) {
    return await this.principalService.unlinkStudentsFromBinome(body.ids);
  }
}
