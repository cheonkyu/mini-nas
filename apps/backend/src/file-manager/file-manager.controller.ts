import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadOptions } from '@mini-nas/shared-types';

@Controller('files')
export class FileManagerController {
  constructor(private readonly fileManager: FileManagerService) {}

  @Post('upload')
  async upload(@Body() body: { path: string; options: UploadOptions }) {
    return { message: 'Upload simulated' };
  }

  @Get(':path*')
  @UseGuards(JwtAuthGuard)
  async download(@Param('path') path: string) {
    return this.fileManager.download(path);
  }

  @Delete(':path*')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('path') path: string) {
    return this.fileManager.delete(path);
  }
}
