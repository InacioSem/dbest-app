import type { Project } from '../../../shared/types';
import type { DistributionChannel, ExportResult, AuthToken, PublishResult } from './types';

export class DownloadChannel implements DistributionChannel {
  readonly id = 'download';
  readonly name = 'Direct Download';
  readonly specs = {
    aspectRatio: '16:9',
    maxDuration: 600, // 10 minutes
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    resolution: '1080p',
    format: 'mp4',
    metadataFields: ['title', 'description'],
  };

  async export(project: Project): Promise<ExportResult> {
    // In production, this would trigger the composition pipeline
    // and return the rendered file URL. For now, returns the project's
    // expected output path.
    const fileUrl = `/exports/${project.id}/final.mp4`;

    return {
      fileUrl,
      format: this.specs.format,
      resolution: this.specs.resolution,
      aspectRatio: this.specs.aspectRatio,
      fileSize: 0, // Will be set after render
      duration: 0, // Will be set after render
    };
  }

  async publish(_exportResult: ExportResult, _auth: AuthToken): Promise<PublishResult> {
    // Download channel doesn't publish anywhere — the file URL is the result
    return {
      publishedUrl: _exportResult.fileUrl,
      platformId: 'local',
      publishedAt: new Date(),
    };
  }
}
