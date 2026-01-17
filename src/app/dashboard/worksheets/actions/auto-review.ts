'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";

export const autoReviewSheet = async (type: string, id: string) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = await apiFetch(`/ingestion/${type}/${id}/auto-review`, {
            method: 'POST',
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'Error al ejecutar la revisión automática',
            };
        }

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error al ejecutar la revisión automática:', error);
        return {
            ok: false,
            message: 'Error al ejecutar la revisión automática',
        };
    }
};
