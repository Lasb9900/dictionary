'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";

export const markPendingEditSheet = async (id: string, observation: string) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = await apiFetch(`/cards/mark-pending-edit/${id}`, {
            method: 'POST',
            body: { observation },
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'Error al reabrir la ficha',
            };
        }

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error al reabrir la ficha:', error);
        return {
            ok: false,
            message: 'Error al reabrir la ficha',
        };
    }
};
