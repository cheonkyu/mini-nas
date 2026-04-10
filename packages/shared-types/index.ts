/**
 * @module SharedTypes
 * Common interfaces and data models for Mini-NAS
 */

export type ProviderType = "local" | "s3" | "google-drive" | "dropbox";

export interface TokenPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export interface FileMetadata {
  name: string;
  size: number;
  modifiedAt: Date;
  storageSource: string;
  mimeType: string;
  md5Checksum?: string;
}

export interface FileEntry {
  path: string;
  metadata: FileMetadata;
  isDirectory: boolean;
}

export interface MountStatus {
  mountPath: string;
  providerType: ProviderType;
  status: "online" | "offline";
  error?: string;
}

export interface ByteRange {
  start: number;
  end: number;
}

export interface UploadOptions {
  chunkSize?: number;
  resumeToken?: string;
  overwritePolicy: "rename" | "overwrite" | "error";
}

export interface UploadResult {
  path: string;
  md5Checksum: string;
  resumeToken?: string;
}

export interface SearchQuery {
  keyword: string;
  fileType?: string;
  sizeRange?: { min?: number; max?: number };
  dateRange?: { from?: Date; to?: Date };
}

export interface ShareOptions {
  expiresAt?: Date;
  password?: string;
  maxDownloads?: number;
}

export interface ShareLink {
  token: string;
  url: string;
  expiresAt?: Date;
  maxDownloads?: number;
}

export interface ShareLinkInfo {
  link: ShareLink;
  filePath: string;
  metadata: FileMetadata;
}

export interface SyncConfig {
  sourceProvider: string;
  targetProvider: string;
  direction: "one-way" | "two-way";
  sourcePath: string;
  targetPath: string;
}

export interface SyncStatus {
  jobId: string;
  state: "running" | "paused" | "completed" | "error";
  progress: { total: number; completed: number; failed: number };
  conflicts: SyncConflict[];
  errors: SyncError[];
}

export interface SyncConflict {
  id: string;
  filePath: string;
  resolution?: ConflictResolution;
}

export interface SyncError {
  filePath: string;
  error: string;
  timestamp: Date;
}

export type ConflictResolution = "use-source" | "use-target" | "keep-both";

export interface SyncJob {
  jobId: string;
  status: SyncStatus;
}

/**
 * Interfaces for Services
 */

export interface AuthService {
  login(
    username: string,
    password: string,
  ): Promise<{ token: string; expiresAt: Date }>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<TokenPayload>;
  refreshToken(token: string): Promise<{ token: string; expiresAt: Date }>;
}

export interface VirtualFilesystem {
  mount(provider: StorageProvider, mountPath: string): Promise<void>;
  unmount(mountPath: string): Promise<void>;
  listDirectory(path: string): Promise<FileEntry[]>;
  getMetadata(path: string): Promise<FileMetadata>;
  getMountStatus(): MountStatus[];
}

export interface FileManager {
  upload(
    path: string,
    stream: any,
    options: UploadOptions,
  ): Promise<UploadResult>;
  download(
    path: string,
    range?: ByteRange,
  ): Promise<{ stream: any; metadata: FileMetadata }>;
  createFolder(path: string): Promise<void>;
  rename(path: string, newName: string): Promise<void>;
  move(srcPath: string, destPath: string): Promise<void>;
  copy(srcPath: string, destPath: string): Promise<void>;
  delete(path: string): Promise<void>;
  search(query: SearchQuery): Promise<FileEntry[]>;
}

export interface ShareService {
  createShareLink(path: string, options: ShareOptions): Promise<ShareLink>;
  getShareLink(token: string, password?: string): Promise<ShareLinkInfo>;
  revokeShareLink(token: string): Promise<void>;
  trackDownload(token: string): Promise<void>;
}

export interface SyncEngine {
  startSync(config: SyncConfig): Promise<SyncJob>;
  stopSync(jobId: string): Promise<void>;
  getSyncStatus(jobId: string): Promise<SyncStatus>;
  resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
  ): Promise<void>;
}

export interface StorageProvider {
  type: ProviderType;
  connect(credentials: any): Promise<void>;
  disconnect(): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  read(path: string, range?: ByteRange): Promise<any>;
  write(path: string, stream: any): Promise<void>;
  delete(path: string): Promise<void>;
  move(srcPath: string, destPath: string): Promise<void>;
  getMetadata(path: string): Promise<FileMetadata>;
}
