import { Module } from '@nestjs/common';
import { VfsService } from './vfs.service.ts';
import { LocalStorageProvider } from '../storage/local.provider';
import { EncryptionUtil } from '../storage/encryption.util';

@Module({
  providers: [VfsService, LocalStorageProvider, EncryptionUtil],
  exports: [VfsService],
})
export class VfsModule {}
