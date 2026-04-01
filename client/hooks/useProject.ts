'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import type { Project, CreativeParameters, ProjectType, Locale } from '@shared/types';

interface CreateProjectInput {
  projectType: ProjectType;
  songLanguage: Locale;
  creativeParams?: Partial<CreativeParameters>;
  stylePresetId?: string;
}

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(async (input: CreateProjectInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<Project>('/projects', input);
      if (res.success && res.data) {
        setProject(res.data);
      } else {
        setError(res.error || 'Failed to create project');
      }
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<Project>(`/projects/${id}`);
      if (res.success && res.data) {
        setProject(res.data);
      } else {
        setError(res.error || 'Project not found');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, params: Partial<CreativeParameters>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.patch<Project>(`/projects/${id}`, { creativeParams: params });
      if (res.success && res.data) {
        setProject(res.data);
      } else {
        setError(res.error || 'Failed to update');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { project, loading, error, createProject, fetchProject, updateProject };
}
