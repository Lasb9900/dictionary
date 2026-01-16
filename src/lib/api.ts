export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; message: string; status?: number };

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_API_URL}${normalizedPath}`;
};

const isFormData = (value: unknown): value is FormData =>
    typeof FormData !== 'undefined' && value instanceof FormData;

export const apiFetch = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> => {
    if (!BASE_API_URL) {
        return {
            ok: false,
            message:
                'Falta configurar NEXT_PUBLIC_API_BASE_URL para comunicarse con el backend.',
        };
    }

    const url = apiUrl(path);
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
            status: response.status,
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
