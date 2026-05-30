import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';
import 'multer';

const UPLOAD_TIMEOUT_MS = 120_000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  api_timeout: UPLOAD_TIMEOUT_MS,
});

type CloudinaryError = {
  message?: string;
  http_code?: number;
  name?: string;
};

@Injectable()
export class CloudinaryService {
  private assertValidFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException(
        'File could not be read. Please retry the upload.',
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException(
        `File is too large. Maximum size is ${MAX_FILE_BYTES / (1024 * 1024)}MB.`,
      );
    }

    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, WEBP images or PDF documents are allowed.',
      );
    }
  }

  private resolveResourceType(mimetype: string): 'image' | 'raw' | 'auto' {
    if (mimetype === 'application/pdf') return 'raw';
    if (mimetype.startsWith('image/')) return 'image';
    return 'auto';
  }

  private buildUploadException(error: unknown): ServiceUnavailableException {
    const err = error as CloudinaryError | undefined;
    const message = err?.message ?? 'Cloudinary upload failed';

    if (
      err?.http_code === 499 ||
      err?.name === 'TimeoutError' ||
      message.toLowerCase().includes('timeout')
    ) {
      return new ServiceUnavailableException(
        'Document upload timed out. Use a smaller file (under 5MB), a JPG/PNG photo instead of PDF if possible, and try again.',
      );
    }

    return new ServiceUnavailableException(
      `Document upload failed: ${message}. Check your connection and Cloudinary settings, then retry.`,
    );
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return this.uploadFile(file, folder);
  }

  /** Upload captain documents, profile photos, etc. Supports images and PDFs. */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.assertValidFile(file);

    const resourceType = this.resolveResourceType(file.mimetype);

    return new Promise((resolve, reject) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(
          new ServiceUnavailableException(
            'Document upload timed out. Try a smaller file or check your internet connection.',
          ),
        );
      }, UPLOAD_TIMEOUT_MS);

      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: resourceType,
        timeout: UPLOAD_TIMEOUT_MS,
      };

      if (resourceType === 'image') {
        uploadOptions.quality = 'auto:good';
        uploadOptions.fetch_format = 'auto';
      }

      if (resourceType === 'raw') {
        uploadOptions.format = 'pdf';
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);

          if (error || !result?.secure_url) {
            reject(this.buildUploadException(error));
            return;
          }

          resolve(result.secure_url);
        },
      );

      stream.on('error', (streamError) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(this.buildUploadException(streamError));
      });

      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
