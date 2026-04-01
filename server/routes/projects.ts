import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import type { ApiResponse, Project } from '../../shared/types';
import { AuthenticatedRequest } from '../middleware/auth';
import { isDemoMode, generateDemoProject, generateDemoStoryboard } from '../lib/demo';
import { logger } from '../lib/logger';
import { getTranslation } from '../i18n/loader';
import type { LocaleRequest } from '../middleware/locale';

type ProjectRequest = AuthenticatedRequest & LocaleRequest;

const router = Router();

// In-memory store for demo mode
const demoProjects = new Map<string, Project>();

/**
 * POST / — Create a new project
 */
router.post('/', async (req: ProjectRequest, res: Response) => {
  try {
    const locale = req.locale || 'en';
    const userId = req.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: getTranslation(locale, 'errors.unauthorized'),
      };
      res.status(401).json(response);
      return;
    }

    const { projectType, pricingTier, songLanguage, creativeParams, stylePresetId } = req.body;

    if (isDemoMode()) {
      const project = generateDemoProject({
        userId,
        projectType: projectType || 'music_video',
        pricingTier: pricingTier || 'standard',
        songLanguage: songLanguage || 'en',
        creativeParams: creativeParams || {},
        stylePresetId,
      });
      demoProjects.set(project.id, project);

      logger.info('Demo project created', { projectId: project.id, userId });

      const response: ApiResponse<Project> = { success: true, data: project };
      res.status(201).json(response);
      return;
    }

    // TODO: Database insert for production
    const project: Project = {
      id: uuid(),
      userId,
      artistProfileId: req.body.artistProfileId || '',
      projectType: projectType || 'music_video',
      pricingTier: pricingTier || 'standard',
      songUrl: '',
      songLanguage: songLanguage || 'en',
      status: 'draft',
      costBreakdown: { total: 0, items: [] },
      creativeParams: creativeParams || {},
      stylePresetId,
      createdAt: new Date(),
    };

    logger.info('Project created', { projectId: project.id, userId });

    const response: ApiResponse<Project> = { success: true, data: project };
    res.status(201).json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to create project', { error });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.createProjectFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * GET / — List user's projects
 */
router.get('/', async (req: ProjectRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const response: ApiResponse = { success: false, error: 'Unauthorized' };
      res.status(401).json(response);
      return;
    }

    if (isDemoMode()) {
      const userProjects = Array.from(demoProjects.values()).filter(
        (p) => p.userId === userId
      );

      // If no projects exist yet, return a sample one
      if (userProjects.length === 0) {
        const sample = generateDemoProject({ userId, status: 'awaiting_approval' });
        demoProjects.set(sample.id, sample);
        userProjects.push(sample);
      }

      const response: ApiResponse<Project[]> = { success: true, data: userProjects };
      res.json(response);
      return;
    }

    // TODO: Database query for production
    const response: ApiResponse<Project[]> = { success: true, data: [] };
    res.json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to list projects', { error });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.listProjectsFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * GET /:id — Get a single project
 */
router.get('/:id', async (req: ProjectRequest, res: Response) => {
  try {
    const { id } = req.params;
    const locale = req.locale || 'en';

    if (isDemoMode()) {
      const project = demoProjects.get(id);
      if (!project) {
        const response: ApiResponse = {
          success: false,
          error: getTranslation(locale, 'errors.projectNotFound'),
        };
        res.status(404).json(response);
        return;
      }
      const response: ApiResponse<Project> = { success: true, data: project };
      res.json(response);
      return;
    }

    // TODO: Database query for production
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.projectNotFound'),
    };
    res.status(404).json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to get project', { error, projectId: req.params.id });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.getProjectFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * PATCH /:id — Update creative params or other project fields
 */
router.patch('/:id', async (req: ProjectRequest, res: Response) => {
  try {
    const { id } = req.params;
    const locale = req.locale || 'en';
    const updates = req.body;

    if (isDemoMode()) {
      const project = demoProjects.get(id);
      if (!project) {
        const response: ApiResponse = {
          success: false,
          error: getTranslation(locale, 'errors.projectNotFound'),
        };
        res.status(404).json(response);
        return;
      }

      // Merge updates into existing project
      if (updates.creativeParams) {
        project.creativeParams = { ...project.creativeParams, ...updates.creativeParams };
      }
      if (updates.pricingTier) {
        project.pricingTier = updates.pricingTier;
      }
      if (updates.songLanguage) {
        project.songLanguage = updates.songLanguage;
      }

      demoProjects.set(id, project);
      logger.info('Demo project updated', { projectId: id });

      const response: ApiResponse<Project> = { success: true, data: project };
      res.json(response);
      return;
    }

    // TODO: Database update for production
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.projectNotFound'),
    };
    res.status(404).json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to update project', { error, projectId: req.params.id });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.updateProjectFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * POST /:id/approve-storyboard — Approve the storyboard to proceed with clip generation
 */
router.post('/:id/approve-storyboard', async (req: ProjectRequest, res: Response) => {
  try {
    const { id } = req.params;
    const locale = req.locale || 'en';

    if (isDemoMode()) {
      const project = demoProjects.get(id);
      if (!project) {
        const response: ApiResponse = {
          success: false,
          error: getTranslation(locale, 'errors.projectNotFound'),
        };
        res.status(404).json(response);
        return;
      }

      project.status = 'generating_clips';
      demoProjects.set(id, project);

      const storyboard = generateDemoStoryboard(id);
      storyboard.approvedAt = new Date();

      logger.info('Demo storyboard approved', { projectId: id });

      const response: ApiResponse<{ project: Project; storyboard: typeof storyboard }> = {
        success: true,
        data: { project, storyboard },
      };
      res.json(response);
      return;
    }

    // TODO: Database update + queue job for production
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.projectNotFound'),
    };
    res.status(404).json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to approve storyboard', { error, projectId: req.params.id });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.approveStoryboardFailed'),
    };
    res.status(500).json(response);
  }
});

/**
 * DELETE /:id — Delete a project
 */
router.delete('/:id', async (req: ProjectRequest, res: Response) => {
  try {
    const { id } = req.params;
    const locale = req.locale || 'en';

    if (isDemoMode()) {
      const existed = demoProjects.delete(id);
      if (!existed) {
        const response: ApiResponse = {
          success: false,
          error: getTranslation(locale, 'errors.projectNotFound'),
        };
        res.status(404).json(response);
        return;
      }

      logger.info('Demo project deleted', { projectId: id });

      const response: ApiResponse<{ deleted: true }> = {
        success: true,
        data: { deleted: true },
      };
      res.json(response);
      return;
    }

    // TODO: Database delete for production
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.projectNotFound'),
    };
    res.status(404).json(response);
  } catch (error) {
    const locale = (req as ProjectRequest).locale || 'en';
    logger.error('Failed to delete project', { error, projectId: req.params.id });
    const response: ApiResponse = {
      success: false,
      error: getTranslation(locale, 'errors.deleteProjectFailed'),
    };
    res.status(500).json(response);
  }
});

export default router;
