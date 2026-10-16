import { prisma } from '../shared/config/database.js';
import type { UploadedFile } from '@prisma/client';
import { NotFoundError } from '../shared/errors/AppError.js';

export class UploadRepository {
  async findAll(): Promise<UploadedFile[]> {
    return prisma.uploadedFile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: number): Promise<UploadedFile | null> {
    return prisma.uploadedFile.findUnique({ where: { id } });
  }

  async create(data: {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    url: string;
  }): Promise<UploadedFile> {
    return prisma.uploadedFile.create({ data });
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('File', String(id));
    }
    await prisma.uploadedFile.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.uploadedFile.count();
  }
}
