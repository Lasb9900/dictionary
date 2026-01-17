import { apiClient } from "@/src/lib/apiClient";
import type { Worksheet } from "@/src/services/ingestion";

export const getPendingEditCards = async () =>
  apiClient<Worksheet[]>("/api/cards/status/pending-edit", {
    method: "GET",
  });

export const getPendingReviewCards = async () =>
  apiClient<Worksheet[]>("/api/cards/status/pending-review", {
    method: "GET",
  });

export const getRejectedCards = async () =>
  apiClient<Worksheet[]>("/api/cards/rejected", {
    method: "GET",
  });

export const getCardById = async (id: string) =>
  apiClient<Worksheet>(`/api/cards/${id}`, {
    method: "GET",
  });

export const rejectCard = async (id: string, observation: string) =>
  apiClient<Worksheet>(`/api/cards/reject/${id}`, {
    method: "POST",
    body: { observation },
  });

export const markPendingEdit = async (id: string, observation: string) =>
  apiClient<Worksheet>(`/api/cards/mark-pending-edit/${id}`, {
    method: "POST",
    body: { observation },
  });
