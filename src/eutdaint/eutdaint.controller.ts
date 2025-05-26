import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EutdaintService } from './eutdaint.service';
import { CompteID, Public } from 'src/authentication/common/decorators';
import {
  CreateEtapeDto,
  CreateFeedbackDto,
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
  @Get('groupe-sujet/:idG')
  async getSujectEtud(@Param('idG', ParseIntPipe) idG: number) {
    return this.eutdaintService.getSujectEtud(idG);
  }
  @Public()
  @Get('binomes/:idB')
  async getBinomeData(@Param('idB', ParseIntPipe) idB: number) {
    return await this.eutdaintService.getBinomeData(idB);
  }
  @Get('feedbacks/:idB')
  async allFeedBack(@Param('idB', ParseIntPipe) idB: number) {
    return await this.eutdaintService.allFeedBack(idB);
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
  async allGQuestionAndReponse(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.eutdaintService.allGQuestionAndReponse(sub);
  }

  @Get('questions')
  async getAllQuestion() {
    return await this.eutdaintService.getAllQuestion();
  }
  @Post('feedback')
  async createFeedBack(@Body() dto: CreateFeedbackDto) {
    return this.eutdaintService.createFeedBack(dto);
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

  @Delete('question/:idQ')
  async deleteQuestion(@Param('idQ', ParseIntPipe) idQ: number) {
    return await this.eutdaintService.deleteQuestion(idQ);
  }
  @Delete(':idF')
  async deleteFeedBack(@Param('idF', ParseIntPipe) idF: number) {
    return await this.eutdaintService.deleteFeedBack(idF);
  }
}
