import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  bigint,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  failedAttempts: integer('failed_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tokenBlacklist = pgTable('token_blacklist', {
  jti: varchar('jti', { length: 255 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const storageProviders = pgTable('storage_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: varchar('type', { length: 32 }).notNull(), // 'local' | 's3' | 'google-drive' | 'dropbox'
  mountPath: varchar('mount_path', { length: 512 }).notNull().unique(),
  credentialsEnc: text('credentials_enc').notNull(), // AES-256-GCM encrypted JSON
  status: varchar('status', { length: 16 }).default('online'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fileMetadata = pgTable(
  'file_metadata',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    providerId: uuid('provider_id').references(() => storageProviders.id),
    virtualPath: varchar('virtual_path', { length: 1024 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    size: bigint('size'),
    mimeType: varchar('mime_type', { length: 128 }),
    md5Checksum: varchar('md5_checksum', { length: 32 }),
    modifiedAt: timestamp('modified_at'),
    isDirectory: boolean('is_directory').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    unq_provider_path: {
      unique: [table.providerId, table.virtualPath],
    },
  }),
);

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 128 }).notNull().unique(),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  expiresAt: timestamp('expires_at'),
  maxDownloads: integer('max_downloads'),
  downloadCount: integer('download_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const syncJobs = pgTable('sync_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sourceProviderId: uuid('source_provider').references(
    () => storageProviders.id,
  ),
  targetProviderId: uuid('target_provider').references(
    () => storageProviders.id,
  ),
  direction: varchar('direction', { length: 16 }).notNull(), // 'one-way' | 'two-way'
  sourcePath: varchar('source_path', { length: 512 }),
  targetPath: varchar('target_path', { length: 512 }),
  state: varchar('state', { length: 16 }).default('pending'),
  progressJson: jsonb('progress_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const syncConflicts = pgTable('sync_conflicts', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => syncJobs.id),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  resolution: varchar('resolution', { length: 16 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const uploadSessions = pgTable('upload_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeToken: varchar('resume_token', { length: 128 }).notNull().unique(),
  targetPath: varchar('target_path', { length: 1024 }).notNull(),
  totalSize: bigint('total_size'),
  uploadedBytes: bigint('uploaded_bytes').default(0),
  lastChunkIdx: integer('last_chunk_idx').default(-1),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
