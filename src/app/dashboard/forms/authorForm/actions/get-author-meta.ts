'use server';

import { apiFetch } from '@/src/lib/api';
import { authOptions } from '@/utils/config/authOptions';
import { getServerSession } from 'next-auth';

export const getAuthorMeta = async (id?: string | string[]) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        if (!id) {
            return {
                ok: false,
                message: 'No se encontró el ID de la ficha',
            };
        }

        const response = await apiFetch(`/cards/${id}`, {
            method: 'GET',
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'No se pudo obtener la ficha',
            };
        }

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error al obtener la ficha:', error);
        return {
            ok: false,
            message: 'No se pudo obtener la ficha',
        };
    }
};
