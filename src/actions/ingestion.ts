'use server';

import { apiFetch } from '@/src/lib/api';

export interface IngestionSaveOptions {
    autoReview?: boolean;
    autoUpload?: boolean;
}

export const ingestionCreateWorksheet = async <T>(payload: T) =>
    apiFetch('/ingestion/worksheet', {
        method: 'POST',
        body: payload,
    });

export const ingestionSave = async <T>(
    type: string,
    id: string | string[],
    payload: T,
    options: IngestionSaveOptions = {}
) =>
    apiFetch(`/ingestion/${type}/${id}/save`, {
        method: 'PUT',
        body: {
            payload,
            options: {
                autoReview: false,
                autoUpload: false,
                ...options,
            },
        },
    });

export const ingestionAutoReview = async (type: string, id: string | string[]) =>
    apiFetch(`/ingestion/${type}/${id}/auto-review`, {
        method: 'POST',
    });

export const ingestionAutoUpload = async (type: string, id: string | string[]) =>
    apiFetch(`/ingestion/${type}/${id}/auto-upload`, {
        method: 'POST',
    });
