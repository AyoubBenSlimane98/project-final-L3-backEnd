import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CodeOtpService } from 'src/code-otp/code-otp.service';
import { EmailService } from 'src/email/email.service';
import { AuthPasswod, AuthSigninDto, AuthSignupDto } from './dto';
import { AuthenticationService } from './authentication.service';
import { RtGuard } from './common/guards';
import { CompteID, Public, User } from './common/decorators';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly emailService: EmailService,
    private readonly codeOtpService: CodeOtpService,
  ) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.CREATED)
  async sendToEmail(@Body('email') email: string) {
    try {
      const otp = await this.codeOtpService.storeOTP(email);
      const { message } = await this.emailService.sendOTPEmail(email, otp);

      if (message !== 'Email sent successfully') {
        throw new InternalServerErrorException('Failed to send OTP email');
      }
      return { message: `OTP sent to ${email} successfully!` };
    } catch (error) {
      console.log(error);
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(
        'Something went wrong while sending OTP',
      );
    }
  }
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return await this.codeOtpService.verifyOTP(email, otp);
  }
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() authSignupDto: AuthSignupDto) {
    return await this.authenticationService.signUp(authSignupDto);
  }
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() authSigninDto: AuthSigninDto) {
    return await this.authenticationService.signIn(authSigninDto);
  }
  @Public()
  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() authPasswod: AuthPasswod) {
    return await this.authenticationService.changePassword(authPasswod);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CompteID('sub', ParseIntPipe) sub: number) {
    return await this.authenticationService.logout(sub);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @User('refreshToken') refreshToken: string,
    @User('sub', ParseIntPipe) sub: number,
  ) {
    return await this.authenticationService.refreshToken(sub, refreshToken);
  }
}
