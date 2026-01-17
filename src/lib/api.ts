export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; message: string; status?: number };

export const getApiBaseUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_API_URL');
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
    const headers = new Headers(options.headers ?? {});
    if (!headers.has('Content-Type') && !isFormData(options.body)) {
        headers.set('Content-Type', 'application/json');
    }
    const body =
        options.body && !isFormData(options.body) && typeof options.body !== 'string'
            ? JSON.stringify(options.body)
            : options.body;

    const response = await fetch(url, {
        ...options,
        headers,
        body,
        credentials: options.credentials ?? 'include',
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
