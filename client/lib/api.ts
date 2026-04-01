import type { ApiResponse } from '@shared/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export async function uploadFile(path: string, file: File, fieldName = 'file'): Promise<ApiResponse<{ url: string }>> {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data as ApiResponse<{ url: string }>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function uploadFiles(path: string, files: File[], fieldName = 'files'): Promise<ApiResponse<{ urls: string[] }>> {
  try {
    const formData = new FormData();
    files.forEach((f) => formData.append(fieldName, f));

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data as ApiResponse<{ urls: string[] }>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
