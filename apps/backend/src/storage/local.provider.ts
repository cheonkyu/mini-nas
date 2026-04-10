import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BaseStorageProvider } from './storage.provider';
import { FileEntry, FileMetadata, ByteRange } from '@mini-nas/shared-types';

@Injectable()
export class LocalStorageProvider extends BaseStorageProvider {
  type = 'local';
  private rootPath: string = '/tmp/mini-nas-local';

  async connect(credentials: any): Promise<void> {
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  async disconnect(): Promise<void> {
    // No-op for local disk
  }

  async list(dirPath: string): Promise<FileEntry[]> {
    const absolutePath = this.resolvePath(dirPath);
    const entries = await fs.promises.readdir(absolutePath, {
      withFileTypes: true,
    });

    return entries.map((entry) => {
      const fullPath = path.join(absolutePath, entry.name);
      const stats = fs.statSync(fullPath);
      return {
        path: dirPath + (dirPath.endsWith('/') ? '' : '/') + entry.name,
        isDirectory: entry.isDirectory(),
        metadata: {
          name: entry.name,
          size: stats.size,
          modifiedAt: stats.mtime,
          storageSource: 'local',
          mimeType: this.getMimeType(entry.name),
        },
      };
    });
  }

  async read(filePath: string, range?: ByteRange): Promise<any> {
    const absolutePath = this.resolvePath(filePath);
    return fs.createReadStream(absolutePath, {
      start: range?.start,
      end: range?.end,
    });
  }

  async write(filePath: string, stream: any): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(absolutePath);
      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  async delete(filePath: string): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    await fs.promises.rm(absolutePath, { recursive: true, force: true });
  }

  async move(srcPath: string, destPath: string): Promise<void> {
    const src = this.resolvePath(srcPath);
    const dest = this.resolvePath(destPath);
    await fs.promises.rename(src, dest);
  }

  async getMetadata(filePath: string): Promise<FileMetadata> {
    const absolutePath = this.resolvePath(filePath);
    const stats = await fs.promises.stat(absolutePath);
    return {
      name: path.basename(absolutePath),
      size: stats.size,
      modifiedAt: stats.mtime,
      storageSource: 'local',
      mimeType: this.getMimeType(path.basename(absolutePath)),
    };
  }

  private resolvePath(virtualPath: string): string {
    const sanitized = path.normalize(virtualPath).replace(/^(\.\.|$)/, '');
    return path.join(this.rootPath, sanitized);
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimes: Record<string, string> = {
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
    };
    return mimes[ext] || 'application/octet-stream';
  }
}
