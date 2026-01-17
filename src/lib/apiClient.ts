import { apiUrl } from "@/src/lib/api";
import { clearStoredAuth, getStoredToken } from "@/src/lib/authStorage";

export type ApiError = {
  message: string;
  status?: number;
  missingFields?: string[];
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

export type ApiClientOptions = RequestInit & {
  auth?: boolean;
  aiProvider?: string;
};

export const apiClient = async <T>(
  path: string,
  { auth = true, aiProvider, ...options }: ApiClientOptions = {}
): Promise<ApiResult<T>> => {
  const token = auth ? getStoredToken() : null;
  const headers: HeadersInit = {
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (aiProvider) {
    headers["x-ai-provider"] = aiProvider;
  }

  const hasBody = options.body !== undefined;
  const body =
    hasBody &&
    options.body &&
    !isFormData(options.body) &&
    typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body;

  if (!isFormData(options.body) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    body,
  });

  let responseData: any = null;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearStoredAuth();
      window.location.href = "/ingestion/login";
    }

    return {
      ok: false,
      error: {
        message:
          responseData?.message ||
          response.statusText ||
          "No se pudo completar la solicitud",
        status: response.status,
        missingFields: responseData?.missingFields ?? undefined,
      },
    };
  }

  return {
    ok: true,
    data: responseData as T,
  };
};
