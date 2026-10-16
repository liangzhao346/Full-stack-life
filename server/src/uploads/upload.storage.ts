import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import type { Request } from 'express';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_FILES_PER_REQUEST } from './upload.dto.js';
import { logger } from '../shared/utils/logger.js';

// Files are stored outside src/ — resolve from project root
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Fix garbled non-ASCII filenames: multer parses headers as latin1 by default
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, '_');
    // timestamp + random string to prevent overwrite
    const unique = crypto.randomBytes(4).toString('hex');
    cb(null, `${Date.now()}-${unique}-${baseName}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    logger.warn('Rejected file — disallowed mime type', { mimetype: file.mimetype });
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
  }
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
  },
});
