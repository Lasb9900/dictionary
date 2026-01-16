'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";



export const SendEditorWorksheet = async (payload: string, id: string | string[]) => {
    const session = await getServerSession(authOptions);

    if (!session?.user.roles.includes('admin')) {
        return {
            ok: false,
            message: 'No tienes permisos para realizar esta acción',
        };
    }

    try {
        const response = await apiFetch(`/cards/mark-pending-edit/${id}`, {
            method: 'POST',
            body: { observation: payload },
        });

        if (!response.ok) {
            console.error('Error al guardar el formulario de autor:', response);
            return {
                ok: false,
                message: response.message || 'No se pudo guardar el formulario del autor',
            };
        }

        revalidatePath('/dashboard/worksheets/rejectedSheets');
        return {
            ok: true,
            message: 'Formulario de autor guardado correctamente',
        };
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return {
            ok: false,
            message: 'No se pudo realizar la acción',
        };
    }
};
