import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VfsModule } from './vfs/vfs.module';

@Module({
  imports: [AuthModule, VfsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
