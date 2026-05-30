import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const documentUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      cb(
        new BadRequestException(
          'Only JPG, PNG, WEBP images or PDF documents are allowed.',
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};

export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadRequestException('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
};
