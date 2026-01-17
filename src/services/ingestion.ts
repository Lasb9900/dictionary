import { apiClient } from "@/src/lib/apiClient";

export type WorksheetType = "AuthorCard" | string;

export type WorksheetPayload = {
  fullName: string;
  text: string;
  works: string[];
  criticism: string[];
};

export type IngestionOptions = {
  autoReview: boolean;
  autoUpload: boolean;
};

export type Worksheet = {
  _id?: string;
  id?: string;
  type?: string;
  title?: string;
  status?: string;
  observation?: string;
  payload?: Partial<WorksheetPayload>;
  updatedAt?: string;
  createdAt?: string;
};

export const createWorksheet = async (data: {
  type: WorksheetType;
  title: string;
  createdBy: string;
}) =>
  apiClient<Worksheet>("/api/ingestion/worksheet", {
    method: "POST",
    body: data,
  });

export const saveWorksheet = async (
  type: WorksheetType,
  id: string,
  payload: WorksheetPayload,
  options: IngestionOptions
) =>
  apiClient<Worksheet>(`/api/ingestion/${type}/${id}/save`, {
    method: "POST",
    body: { payload, options },
  });

export const autoReview = async (
  type: WorksheetType,
  id: string,
  aiProvider?: string
) =>
  apiClient<Worksheet>(`/api/ingestion/${type}/${id}/auto-review`, {
    method: "POST",
    aiProvider,
  });

export const autoUpload = async (
  type: WorksheetType,
  id: string,
  aiProvider?: string
) =>
  apiClient<Worksheet>(`/api/ingestion/${type}/${id}/auto-upload`, {
    method: "POST",
    aiProvider,
  });

export const autoOrchestrate = async (
  type: WorksheetType,
  id: string,
  payload: WorksheetPayload,
  options: IngestionOptions,
  aiProvider?: string
) =>
  apiClient<Worksheet>(`/api/ingestion/${type}/${id}/auto-orchestrate`, {
    method: "POST",
    aiProvider,
    body: {
      payload,
      options,
    },
  });
