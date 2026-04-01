import type { Project } from '../../../shared/types';

export interface ExportResult {
  fileUrl: string;
  format: string;
  resolution: string;
  aspectRatio: string;
  fileSize: number;
  duration: number;
}

export interface PublishResult {
  publishedUrl: string;
  platformId: string;
  publishedAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface DistributionChannel {
  id: string;
  name: string;
  specs: {
    aspectRatio: string;
    maxDuration: number;
    maxFileSize: number;
    resolution: string;
    format: string;
    metadataFields: string[];
  };
  export(project: Project): Promise<ExportResult>;
  publish(exportResult: ExportResult, auth: AuthToken): Promise<PublishResult>;
}
