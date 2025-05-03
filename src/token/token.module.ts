import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  exports: [TokenService],
  imports: [JwtModule.register({ global: true })],
  providers: [TokenService],
})
export class TokenModule {}
