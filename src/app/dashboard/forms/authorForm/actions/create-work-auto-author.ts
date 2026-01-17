'use server';

import { apiFetch } from '@/src/lib/api';
import { authOptions } from '@/utils/config/authOptions';
import { getServerSession } from 'next-auth';

interface CreateWorkAutoAuthorPayload {
    authorId?: string | string[];
    work: unknown;
}

export const createWorkAutoAuthor = async ({ authorId, work }: CreateWorkAutoAuthorPayload) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return {
            ok: false,
            message: 'El usuario debe estar autenticado para realizar esta acción',
        };
    }

    if (!authorId) {
        return {
            ok: false,
            message: 'No se encontró el ID del autor',
        };
    }

    // TODO: Reemplazar por el endpoint real del backend cuando esté disponible.
    // Ejemplo esperado: POST /ingestion/work/auto-author
    // body: { authorId, work }
    return {
        ok: false,
        message: 'TODO_ENDPOINT',
    };

    // eslint-disable-next-line no-unreachable
    const response = await apiFetch('/ingestion/work/auto-author', {
        method: 'POST',
        body: { authorId, work },
    });

    if (!response.ok) {
        return {
            ok: false,
            message: response.message || 'No se pudo crear la obra',
        };
    }

    return {
        ok: true,
        data: response.data,
    };
};
