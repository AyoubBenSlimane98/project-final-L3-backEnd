import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EutdaintService } from './eutdaint.service';
import { CompteID, Public } from 'src/authentication/common/decorators';
import {
  CreateEtapeDto,
  CreateRapportMemoireDto,
  CreateTacheDto,
  QuestionDto,
} from './dto';

@Controller('eutdaint')
export class EutdaintController {
  constructor(private readonly eutdaintService: EutdaintService) {}

  @Get('binome')
  async getInfoEtudiant(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.eutdaintService.getInfoEtudiant(sub);
  }
  @Get('note/:idU')
  async getNoteEtapesForEtudiant(@Param('idU', ParseIntPipe) idU: number) {
    return this.eutdaintService.getNoteEtapEtudiant(idU);
  }
  @Public()
  @Get('binomes/:idB')
  async getBinomeData(@Param('idB', ParseIntPipe) idB: number) {
    return await this.eutdaintService.getBinomeData(idB);
  }

  @Get('cas/:idG/groupe')
  async getAllCas(@Param('idG', ParseIntPipe) idG: number) {
    return await this.eutdaintService.getAllCas(idG);
  }
  @Get('cas/:idB/binome')
  async getAllCasOfBinome(@Param('idB', ParseIntPipe) idB: number) {
    return await this.eutdaintService.getAllCasOfBinome(idB);
  }
  @Get('annoces')
  async getAllAnnoces() {
    return await this.eutdaintService.getAllAnnoces();
  }

  @Get('sujet')
  async getSujetofGroupe(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.eutdaintService.getSujetofGroupe(sub);
  }

  @Get('question')
  async getResponsableofGroupe(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.eutdaintService.getResponsableofGroupe(sub);
  }

  @Get('questions')
  async getAllQuestion() {
    return await this.eutdaintService.getAllQuestion();
  }

  @Post('question')
  async createQuestion(@Body() questionDto: QuestionDto) {
    return await this.eutdaintService.createQuestion(questionDto);
  }
  @Post('deposer-rapport-etape')
  async createRapportEtape(@Body() createEtapeDto: CreateEtapeDto) {
    return this.eutdaintService.createRapportEtape(createEtapeDto);
  }
  @Post('deposer-rapport-memoire')
  async createRapportMemoier(@Body() createEtapeDto: CreateRapportMemoireDto) {
    return this.eutdaintService.createRapportMemoier(createEtapeDto);
  }
  @Public()
  @Post('deposer-rapport')
  async createRapport(@Body() createTacheDto: CreateTacheDto) {
    return await this.eutdaintService.createRapport(createTacheDto);
  }
}
