import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token missing');
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Request() req: any) {
    return { valid: true, user: req.user };
  }

  @Put('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token missing');
    return this.authService.refreshToken(token);
  }
}
