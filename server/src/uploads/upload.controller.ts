import { Router } from 'express';
import multer from 'multer';
import type { UploadService } from './upload.service.js';
import { deleteFileSchema, MAX_FILES_PER_REQUEST } from './upload.dto.js';
import { ValidationError, BadRequestError } from '../shared/errors/AppError.js';
import { uploadMiddleware } from './upload.storage.js';

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  getRouter(): Router {
    const router = Router();

    // List all uploaded files
    router.get('/', async (_req, res, next) => {
      try {
        const result = await this.uploadService.listFiles();
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    // Get single file metadata
    router.get('/:id', async (req, res, next) => {
      try {
        const parsed = deleteFileSchema.safeParse({ id: req.params.id });
        if (!parsed.success) {
          throw new ValidationError(parsed.error.errors);
        }
        const file = await this.uploadService.getFile(parsed.data.id);
        res.json({ data: file });
      } catch (err) {
        next(err);
      }
    });

    // Upload one or more files (multipart/form-data, field name: "files")
    router.post('/', uploadMiddleware.array('files', MAX_FILES_PER_REQUEST), async (req, res, next) => {
      try {
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
          throw new BadRequestError('No file provided. Attach files under the "files" field.');
        }
        const saved = await this.uploadService.saveFiles(files, req);
        res.status(201).json({ data: saved, message: `${saved.length} file(s) uploaded` });
      } catch (err) {
        // Translate multer's own errors into typed app errors
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError('File is too large (max 10 MB).'));
          }
          if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new BadRequestError('Unsupported file type or too many files.'));
          }
          return next(new BadRequestError(`Upload error: ${err.message}`));
        }
        next(err);
      }
    });

    // Delete a file (DB record + physical file)
    router.delete('/:id', async (req, res, next) => {
      try {
        const parsed = deleteFileSchema.safeParse({ id: req.params.id });
        if (!parsed.success) {
          throw new ValidationError(parsed.error.errors);
        }
        await this.uploadService.deleteFile(parsed.data.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    return router;
  }
}
