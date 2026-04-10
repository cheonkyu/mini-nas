import { StorageProvider } from '@mini-nas/shared-types';

export abstract class BaseStorageProvider implements StorageProvider {
  abstract type: string;
  abstract connect(credentials: any): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract list(path: string): Promise<any[]>;
  abstract read(path: string, range?: any): Promise<any>;
  abstract write(path: string, stream: any): Promise<void>;
  abstract delete(path: string): Promise<void>;
  abstract move(srcPath: string, destPath: string): Promise<void>;
  abstract getMetadata(path: string): Promise<any>;
}
