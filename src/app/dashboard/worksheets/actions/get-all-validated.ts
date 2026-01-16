'use server'

import { apiFetch } from '@/src/lib/api';
import { normalizeWorksheetStatus } from '@/src/lib/worksheet-status';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";

export const getAllValidated = async (userId?: string) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = !userId
            ? await apiFetch('/cards/status/validated', {
                method: 'GET',
            })
            : await apiFetch(`/cards/user/${userId}/validated`, {
                method: 'GET',
            });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'Error al obtener las fichas',
            };
        }

        return {
            ok: true,
            data: normalizeWorksheetStatus(response.data),
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'Error al obtener las fichas',
        };
    }
};
