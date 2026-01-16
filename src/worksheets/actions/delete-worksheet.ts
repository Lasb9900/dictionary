'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export const deleteCard = async (cardId: string | undefined) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = await apiFetch(`/cards/${cardId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'Error al eliminar la ficha',
            };
        }

        revalidatePath('/dashboard/worksheets/validatedSheets');

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching cards:', error);
        return {
            ok: false,
            message: 'Error al eliminar la ficha',
        };
    }
};
