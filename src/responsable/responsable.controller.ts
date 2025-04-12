import { Body, Controller, ParseIntPipe, Post } from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { CompteID } from 'src/authentication/common/decorators';
import { CreateSujetDto } from './dto';

@Controller('responsable')
export class ResponsableController {
  constructor(private readonly responsableService: ResponsableService) {}
  @Post('sujet')
  async createSujet(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() createSujetDto: CreateSujetDto,
  ) {
    return await this.responsableService.createSujet(sub, createSujetDto);
  }
}
