import { z } from 'zod';

// Allowed MIME types — images + common document formats
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_REQUEST = 10;

export const uploadedFileSchema = z.object({
  id: z.number(),
  originalName: z.string(),
  storedName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  createdAt: z.date(),
});

export const deleteFileSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type UploadedFileDto = z.infer<typeof uploadedFileSchema>;
