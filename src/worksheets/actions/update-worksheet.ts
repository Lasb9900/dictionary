'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

interface UpdateWorksheetPayload {
    id: string | undefined
    title: string;
    type: string;
    assignedEditors: string[];
    assignedReviewers: string[];
}

export const updateWorksheet = async (payload: UpdateWorksheetPayload) => {

    const session = await getServerSession(authOptions);
    const { id, type, ...body } = payload;

    console.log("ID: ",id)
    if (!session?.user.roles.includes('admin')) {
        return {
            ok: false,
            message: 'No tienes permisos para realizar esta acción',
        };
    }

    try {
        const response = await apiFetch(`/cards/${id}`, {
            method: 'PUT',
            body: { ...body },
        });

        if (!response.ok) {
            console.error('Error creating worksheet:', response);
            return {
                ok: false,
                message: response.message || 'No se pudo actualizar la ficha',
            };
        }

        revalidatePath('/dashboard/worksheets/validatedSheets');

        return {
            ok: true,
            message: 'Ficha creada correctamente',
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'No se pudo actualizar el rol',
        };
    }
}
