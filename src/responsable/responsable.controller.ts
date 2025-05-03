import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ResponsableService } from './responsable.service';

import {
  CreateReunionDto,
  CreateSujetDto,
  RepondreQuestionDto,
  UpdateCasSujetDto,
  UpdateResponsabiliteDto,
} from './dto';
import { CompteID, Public } from 'src/authentication/common/decorators';
import { SetCasDto } from 'src/principal/dto';

@Controller('responsable')
export class ResponsableController {
  constructor(private readonly responsableService: ResponsableService) {}

  @Get()
  async getAllRsponsableValid() {
    return await this.responsableService.getAllRsponsableValid();
  }

  @Get('enseignant')
  async getResponsableOfReunion(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.responsableService.getResponsableOfReunion(sub);
  }

  @Public()
  @Get('cas-sujet')
  async getAllCasofSujet(
    @Query('idS', ParseIntPipe) idS: number,
    @Query('acteur') acteur: string,
  ) {
    return await this.responsableService.getAllCasofSujet(idS, acteur);
  }

  @Public()
  @Get('groupe')
  async getAllQuestionOfGroupe(
    @Query('groupeId', ParseIntPipe) groupeId: number,
    @Query('enseignantId', ParseIntPipe) enseignantId: number,
  ) {
    return await this.responsableService.getAllQuestionOfGroupe({
      groupeId,
      enseignantId,
    });
  }

  @Public()
  @Get('groupe-responsable/:enseignantId')
  async getGroupesOfResponsable(
    @Param('enseignantId', ParseIntPipe) enseignantId: number,
  ) {
    return await this.responsableService.getGroupesOfResponsable(enseignantId);
  }

  @Public()
  @Get('sujet-groupe/:idG')
  async getIdOfSujet(@Param('idG', ParseIntPipe) idG: number) {
    return await this.responsableService.getIdOfSujet(idG);
  }

  @Public()
  @Get('all-groupes/:idG')
  async newGetAllBinomesByGroupe(@Param('idG', ParseIntPipe) idG: number) {
    return await this.responsableService.getAllBinomesByGroupe(idG);
  }
  @Public()
  @Get('all-groupes/:idG/responsabilite')
  async getAllBinomesByGroupeWithResponsabilte(
    @Param('idG', ParseIntPipe) idG: number,
  ) {
    return await this.responsableService.getAllBinomesByGroupeWithResponsabilte(
      idG,
    );
  }

  @Get('sujet/:idS')
  async getAllActorOfCas(@Param('idS', ParseIntPipe) idS: number) {
    return await this.responsableService.getAllActorOfCas(idS);
  }

  @Post('sujet')
  async createSujet(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() createSujetDto: CreateSujetDto,
  ) {
    return await this.responsableService.createSujet(sub, createSujetDto);
  }

  @Post('set-cas/:idG')
  async setCasOfSujet(
    @Param('idG', ParseIntPipe) idG: number,
    @Body() dto: SetCasDto,
  ) {
    return this.responsableService.setCasOfSujet(idG, dto);
  }

  @Post('reunion')
  async createReunion(@Body() createReunionDto: CreateReunionDto) {
    return await this.responsableService.createReunion(createReunionDto);
  }

  @Put('repondre')
  async repondreQuestion(@Body() dto: RepondreQuestionDto) {
    return await this.responsableService.repondreQuestion(dto);
  }
  @Put('update-cas')
  async updateCasOfSujet(
    @Query('idS', ParseIntPipe) idS: number,
    @Query('idB', ParseIntPipe) idB: number,
    @Body() dto: UpdateCasSujetDto,
  ) {
    return this.responsableService.updateCasofSujet(idS, idB, dto.cas);
  }
  @Put('bloquer/:idQ')
  async bloquer(@Param('idQ', ParseIntPipe) idQ: number) {
    return this.responsableService.bloquerQuestion(idQ);
  }
  @Put('binome/:idB/responsabilite')
  updateResponsabilite(
    @Param('idB', ParseIntPipe) idB: number,
    @Body() dto: UpdateResponsabiliteDto,
  ) {
    return this.responsableService.updateResponsabiliteBinome(idB, dto);
  }
  @Get(':enseignantId')
  async getSujetOfResponsable(
    @Param('enseignantId', ParseIntPipe) enseignantId: number,
  ) {
    return await this.responsableService.getSujetOfResponsable(enseignantId);
  }
}
