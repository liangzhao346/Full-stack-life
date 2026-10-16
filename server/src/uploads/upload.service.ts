import fs from 'fs';
import path from 'path';
import type { UploadRepository } from './upload.repository.js';
import type { UploadedFile } from '@prisma/client';
import { UPLOAD_DIR } from './upload.storage.js';
import { logger } from '../shared/utils/logger.js';

export class UploadService {
  constructor(private readonly uploadRepo: UploadRepository) {}

  async listFiles(): Promise<{ data: UploadedFile[]; total: number }> {
    const [data, total] = await Promise.all([this.uploadRepo.findAll(), this.uploadRepo.count()]);
    logger.info('Fetched uploaded file list', { count: data.length, total });
    return { data, total };
  }

  async getFile(id: number): Promise<UploadedFile> {
    const file = await this.uploadRepo.findById(id);
    if (!file) {
      const { NotFoundError } = await import('../shared/errors/AppError.js');
      throw new NotFoundError('File', String(id));
    }
    return file;
  }

  /**
   * Persist metadata for files that multer already wrote to disk.
   */
  async saveFiles(files: Express.Multer.File[], req: { protocol: string; get(name: string): string | undefined }): Promise<UploadedFile[]> {
    const host = req.get('host') || 'localhost:3000';
    const base = `${req.protocol}://${host}`;
    const saved: UploadedFile[] = [];

    for (const file of files) {
      const record = await this.uploadRepo.create({
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url: `${base}/uploads/${file.filename}`,
      });
      saved.push(record);
      logger.info('File uploaded', {
        fileId: record.id,
        name: record.originalName,
        size: record.size,
        mime: record.mimeType,
      });
    }

    return saved;
  }

  /**
   * Delete both the database record and the physical file from disk.
   */
  async deleteFile(id: number): Promise<void> {
    const file = await this.getFile(id);
    await this.uploadRepo.delete(id);

    const filePath = path.join(UPLOAD_DIR, file.storedName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      // Log but don't fail — the DB record is already gone
      logger.warn('Failed to remove physical file', {
        storedName: file.storedName,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    logger.info('File deleted', { fileId: id, storedName: file.storedName });
  }
}
