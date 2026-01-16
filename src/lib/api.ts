export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; message: string };

const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '') ?? '';

const isFormData = (value: unknown): value is FormData =>
    typeof FormData !== 'undefined' && value instanceof FormData;

export const apiFetch = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${API_BASE_URL}${normalizedPath}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
    };
    const body =
        options.body && !isFormData(options.body) && typeof options.body !== 'string'
            ? JSON.stringify(options.body)
            : options.body;

    const response = await fetch(url, {
        ...options,
        headers,
        body,
    });

    let responseData: T | { message?: string } | null = null;
    try {
        responseData = await response.json();
    } catch {
        responseData = null;
    }

    if (!response.ok) {
        return {
            ok: false,
            message:
                (responseData as { message?: string } | null)?.message ||
                response.statusText ||
                'No se pudo completar la solicitud',
        };
    }

    return {
        ok: true,
        data: responseData as T,
    };
};
