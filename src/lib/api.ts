export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; message: string; status?: number };

export const getApiBaseUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');
    }
    return baseUrl;
};

export const apiUrl = (path: string) => {
    const baseUrl = getApiBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
};

const isFormData = (value: unknown): value is FormData =>
    typeof FormData !== 'undefined' && value instanceof FormData;

export const apiFetch = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> => {
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
