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
import { AdminService } from './admin.service';
import {
  AdminAnnonce,
  AdminInfoProfil,
  AdminPasswordDto,
  AdminSignupDto,
} from './dto';
import { CompteID, Public } from 'src/authentication/common/decorators';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Public()
  @Get('all-users')
  async getAllUsers() {
    return await this.adminService.getAllUsers();
  }

  @Get('profil')
  async getAdmin(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.adminService.getAdmin(sub);
  }
  @Get('info-profil')
  async getProfile(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.adminService.getProfile(sub);
  }
  @Get('all-Annonces')
  async getAllAnnounces(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.adminService.getAllAnnounces(sub);
  }
  @Public()
  @Post('sign-up')
  async createAccount(@Body() adminSignupDto: AdminSignupDto) {
    return await this.adminService.createAccount(adminSignupDto);
  }
  @Post('annonce')
  async createAnnonce(
    @Body() adminAnnonce: AdminAnnonce,
    @CompteID('sub') sub: number,
  ) {
    return await this.adminService.createAnnonce(adminAnnonce, sub);
  }
  @Public()
  @Delete('user')
  async deleteUser(@Body('email') email: string) {
    return await this.adminService.deleteUser(email);
  }

  @Delete('annonce/:id')
  async deleteAnnonce(
    @Param('id', ParseIntPipe) id: number,
    @CompteID('sub', ParseIntPipe) sub: number,
  ) {
    return await this.adminService.deleteAnnonce(sub, id);
  }
  @Put('annonce/:id')
  async updateAnnonce(
    @Param('id', ParseIntPipe) id: number,
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() adminAnnonce: AdminAnnonce,
  ) {
    return await this.adminService.updateAnnonce(sub, id, adminAnnonce);
  }
  @Put('profil/img')
  async updateImageProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body('image') image: string,
  ) {
    return await this.adminService.updateImageProfile(sub, image);
  }
  @Put('profil/info')
  async updateInfoProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() adminInfoProfil: AdminInfoProfil,
  ) {
    return await this.adminService.updateInfoProfile(sub, adminInfoProfil);
  }
  @Put('profil/password')
  async updatepasswordProfile(
    @CompteID('sub', ParseIntPipe) sub: number,
    @Body() adminPasswordDto: AdminPasswordDto,
  ) {
    return await this.adminService.updatepasswordProfile(sub, adminPasswordDto);
  }
}
