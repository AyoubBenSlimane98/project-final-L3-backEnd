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
  CreateEtapePayloadDTO,
  CreateNoteDto,
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
  @Get('dates')
  async getAllDates() {
    return await this.responsableService.getAllDates();
  }
  @Public()
  @Get('presences')
  getAllPresencesByGroupe() {
    return this.responsableService.getAllStudent();
  }
  @Public()
  @Get('taches')
  async getAllTacheOfEtapeByBinome(
    @Query('idB', ParseIntPipe) idB: number,
    @Query('idEtape', ParseIntPipe) idEtape: number,
  ) {
    return await this.responsableService.getAllTacheOfEtapeByBinome(
      idB,
      idEtape,
    );
  }
  @Public()
  @Get('etape/:idG')
  async getAllEtapesOfGroupe(@Param('idG', ParseIntPipe) idG: number) {
    return await this.responsableService.getAllEtapesOfGroupe(idG);
  }
  @Get('binomes/:idG')
  async getAllEtudiantOfGroupe(@Param('idG', ParseIntPipe) idG: number) {
    return await this.responsableService.getAllEtudiantOfGroupe(idG);
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
  @Post('presence')
  createPresence(
    @Body() body: { etudiantId: number; idDP: number; etat: string },
  ) {
    return this.responsableService.setAbasenceEtudiant(
      body.etudiantId,
      body.idDP,
      body.etat,
    );
  }
  @Post('set-cas/:idG')
  async setCasOfSujet(
    @Param('idG', ParseIntPipe) idG: number,
    @Body() dto: SetCasDto,
  ) {
    return this.responsableService.setCasOfSujet(idG, dto);
  }
  @Post('etape-tache/:idS')
  async createEtapeTache(
    @Body() createEtapePayloadDTO: CreateEtapePayloadDTO,
    @Param('idS', ParseIntPipe) idS: number,
  ) {
    return this.responsableService.createEtapeTache(idS, createEtapePayloadDTO);
  }
  @Post('note/:idEtape/:idB')
  asynccreateOrUpdateNoteEtapes(
    @Param('idEtape', ParseIntPipe) idEtape: number,
    @Param('idB', ParseIntPipe) idB: number,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    console.log({ idB, idEtape, ...createNoteDto });
    return this.responsableService.createOrUpdateNoteEtapes(
      idB,
      idEtape,
      createNoteDto.note,
    );
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
  @Put('evaluation-rapport')
  async updateEvaluationRapport(@Body() body: { idR: number; statut: string }) {
    console.log('idR :', body.idR, 'statut :', body.statut);
    return await this.responsableService.updateEvaluationRapport(
      body.idR,
      body.statut,
    );
  }
  @Put('bloquer/:idQ')
  async bloquer(@Param('idQ', ParseIntPipe) idQ: number) {
    return this.responsableService.bloquerQuestion(idQ);
  }
  @Put('etudiant/:idU/noteFinal')
  async setOrUpdateNoteFinal(
    @Param('idU', ParseIntPipe) idU: number,
    @Body('noteFinal', ParseIntPipe) noteFinal: number,
  ) {
    return await this.responsableService.setOrUpdateNoteFinal(idU, noteFinal);
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
