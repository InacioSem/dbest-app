'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../lib/api';
import type { ProjectStatus } from '@shared/types';

interface JobStatusResult {
  status: ProjectStatus;
  progress: number;
  estimatedTime?: number;
}

const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  draft: 0,
  uploading: 5,
  processing_audio: 15,
  analyzing_lyrics: 30,
  generating_storyboard: 45,
  awaiting_approval: 50,
  generating_clips: 65,
  composing: 85,
  exporting: 95,
  completed: 100,
  failed: 0,
};

// Map status keys to the processing page step keys
const STATUS_TO_STEP: Partial<Record<ProjectStatus, string>> = {
  processing_audio: 'processingAudio',
  analyzing_lyrics: 'analyzingLyrics',
  generating_storyboard: 'generatingStoryboard',
  awaiting_approval: 'awaitingApproval',
  generating_clips: 'generatingClips',
  composing: 'composing',
};

export function useJobStatus(projectId?: string | null) {
  const [status, setStatus] = useState<string>('processingAudio');
  const [progress, setProgress] = useState(15);
  const [estimatedTime, setEstimatedTime] = useState(180);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await apiClient.get<JobStatusResult>(`/projects/${projectId}`);
      if (res.success && res.data) {
        const s = res.data.status;
        setStatus(STATUS_TO_STEP[s] || s);
        setProgress(STATUS_PROGRESS[s] ?? 0);
        setEstimatedTime(res.data.estimatedTime ?? 0);

        if (s === 'completed' || s === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch {
      // Silently retry on next poll
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      // Demo mode: simulate progress
      const steps = ['processingAudio', 'analyzingLyrics', 'generatingStoryboard'];
      let idx = 0;
      setStatus(steps[0]);
      setProgress(15);
      setEstimatedTime(180);

      intervalRef.current = setInterval(() => {
        idx = Math.min(idx + 1, steps.length - 1);
        setStatus(steps[idx]);
        setProgress(15 + idx * 15);
        setEstimatedTime(Math.max(0, 180 - idx * 60));
      }, 5000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [projectId, poll]);

  return { status, progress, estimatedTime };
}
