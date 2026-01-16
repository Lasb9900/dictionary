'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export const deleteUser = async (userId: string | undefined) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = await apiFetch(`/users/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'Error al eliminar el usuario',
            };
        }

        revalidatePath('/dashboard/users');

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'Error al eliminar el usuario',
        };
    }
};
