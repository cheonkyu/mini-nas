import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LocalStorageProvider } from '../storage/local.provider';
import {
  StorageProvider,
  MountStatus,
  FileEntry,
  FileMetadata,
} from '@mini-nas/shared-types';
import { db } from '../db';
import { storageProviders } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class VfsService {
  private readonly logger = new Logger(VfsService.name);
  private mountedProviders = new Map<string, StorageProvider>();

  constructor(private localProvider: LocalStorageProvider) {}

  async onModuleInit() {
    await this.initializeMounts();
  }

  async initializeMounts() {
    const activeProviders = await db.select().from(storageProviders);
    for (const provider of activeProviders) {
      await this.mountProvider(provider.mountPath, provider.type, provider.id);
    }
  }

  async mount(providerType: string, mountPath: string, credentials: any) {
    let provider: StorageProvider;

    switch (providerType) {
      case 'local':
        provider = this.localProvider;
        break;
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }

    await provider.connect(credentials);
    this.mountedProviders.set(mountPath, provider);

    return { mountPath, status: 'online' };
  }

  async unmount(mountPath: string) {
    if (!this.mountedProviders.has(mountPath)) {
      throw new Error(`Path ${mountPath} is not mounted`);
    }

    const provider = this.mountedProviders.get(mountPath);
    await provider.disconnect();
    this.mountedProviders.delete(mountPath);
  }

  async listDirectory(virtualPath: string): Promise<FileEntry[]> {
    const mount = this.findMount(virtualPath);
    const relativePath = this.getRelativePath(virtualPath, mount.mountPath);

    try {
      return await mount.provider.list(relativePath);
    } catch (error) {
      this.logger.error(
        `Provider at ${mount.mountPath} failed: ${error.message}`,
      );
      return [];
    }
  }

  async getMetadata(virtualPath: string): Promise<FileMetadata> {
    const mount = this.findMount(virtualPath);
    const relativePath = this.getRelativePath(virtualPath, mount.mountPath);

    try {
      return await mount.provider.getMetadata(relativePath);
    } catch (error) {
      throw new Error(`Provider at ${mount.mountPath} is offline`);
    }
  }

  getMountStatus(): MountStatus[] {
    const statuses: MountStatus[] = [];
    this.mountedProviders.forEach((provider, path) => {
      statuses.push({
        mountPath: path,
        providerType: provider.type,
        status: 'online',
      });
    });
    return statuses;
  }

  private findMount(virtualPath: string) {
    const sortedMounts = Array.from(this.mountedProviders.keys()).sort(
      (a, b) => b.length - a.length,
    );
    for (const path of sortedMounts) {
      if (virtualPath.startsWith(path)) {
        return { mountPath: path, provider: this.mountedProviders.get(path)! };
      }
    }
    throw new Error('No provider mounted at this path');
  }

  private getRelativePath(virtualPath: string, mountPath: string): string {
    return virtualPath.replace(mountPath, '').replace(/^\/+/, '');
  }

  private async mountProvider(mountPath: string, type: string, id: string) {
    let provider: StorageProvider;
    if (type === 'local') {
      provider = this.localProvider;
    } else {
      return;
    }

    await provider.connect({});
    this.mountedProviders.set(mountPath, provider);
  }
}
