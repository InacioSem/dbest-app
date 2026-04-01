import { Router, Response } from 'express';
import type { ApiResponse } from '../../shared/types';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadSong, uploadPhotos } from '../middleware/upload';
import { logger } from '../lib/logger';
import { getTranslation } from '../i18n/loader';
import type { LocaleRequest } from '../middleware/locale';

type UploadRequest = AuthenticatedRequest & LocaleRequest;

const router = Router();

/**
 * POST /song — Upload a single song file (MP3 or WAV, max 100MB)
 */
router.post('/song', uploadSong.single('song'), async (req: UploadRequest, res: Response) => {
  try {
    const locale = req.locale || 'en';

    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: getTranslation(locale, 'errors.noFileUploaded'),
      };
      res.status(400).json(response);
      return;
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      path: req.file.path,
    };

    logger.info('Song uploaded', {
      userId: req.userId,
      filename: fileInfo.filename,
      size: fileInfo.size,
    });

    const response: ApiResponse<typeof fileInfo> = {
      success: true,
      data: fileInfo,
    };
    res.status(201).json(response);
  } catch (error) {
    const locale = (req as UploadRequest).locale || 'en';
    logger.error('Song upload failed', { error, userId: req.userId });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.uploadFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * POST /photos — Upload up to 5 photos (JPG, PNG, WebP, max 10MB each)
 */
router.post('/photos', uploadPhotos.array('photos', 5), async (req: UploadRequest, res: Response) => {
  try {
    const locale = req.locale || 'en';
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: getTranslation(locale, 'errors.noFilesUploaded'),
      };
      res.status(400).json(response);
      return;
    }

    const fileInfos = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`,
      path: file.path,
    }));

    logger.info('Photos uploaded', {
      userId: req.userId,
      count: fileInfos.length,
    });

    const response: ApiResponse<typeof fileInfos> = {
      success: true,
      data: fileInfos,
    };
    res.status(201).json(response);
  } catch (error) {
    const locale = (req as UploadRequest).locale || 'en';
    logger.error('Photo upload failed', { error, userId: req.userId });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.uploadFailed'),
    };
    res.status(500).json(response);
  }
});

export default router;
