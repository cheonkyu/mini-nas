import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { VfsService } from '../vfs/vfs.service';
import {
  UploadOptions,
  UploadResult,
  ByteRange,
  FileMetadata,
  FileEntry,
  SearchQuery,
} from '@mini-nas/shared-types';
import { db } from '../db';
import { fileMetadata } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class FileManagerService {
  constructor(private vfsService: VfsService) {}

  async upload(
    virtualPath: string,
    stream: Readable,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const finalPath = this.resolveConflict(
      virtualPath,
      options.overwritePolicy,
    );

    // In a real implementation, this should call vfsService.write
    // For now, we simulate the write and a successful upload
    const checksum = await this.calculateMd5(stream);

    await db.insert(fileMetadata).values({
      virtualPath: finalPath,
      name: finalPath.split('/').pop() || '',
      md5Checksum: checksum,
    });

    return {
      path: finalPath,
      md5Checksum: checksum,
    };
  }

  async download(virtualPath: string, range?: ByteRange) {
    return this.vfsService.getMetadata(virtualPath).then((metadata) => {
      // This would call vfsService.read(virtualPath, range)
      return { stream: { pipe: () => {} }, metadata };
    });
  }

  async delete(virtualPath: string) {
    // This would call vfsService.delete(virtualPath)
    await db
      .delete(fileMetadata)
      .where(eq(fileMetadata.virtualPath, virtualPath));
  }

  private resolveConflict(
    path: string,
    policy: UploadOptions['overwritePolicy'],
  ): string {
    const parts = path.split('.');
    const ext = parts.pop() || '';
    const name = parts.join('.');

    // Simple mock collision check (in real case use vfsService.getMetadata)
    if (policy === 'rename') {
      return `${name}_${Date.now()}.${ext}`;
    }
    return path;
  }

  private async calculateMd5(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}
