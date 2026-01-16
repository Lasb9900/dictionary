'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export const changeUserRole = async( userId: string | undefined, roles: string[] = []) => {

    const session = await getServerSession(authOptions);

    if ( !session?.user.roles.includes('admin') ) {
        return {
            ok: false,
            message: 'No tienes permisos para realizar esta acción',
        };
    }

    try{
        const response = await apiFetch(`/users/assign-roles`, {
            method: 'PUT',
            body: { userId, roles },
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'No se pudo actualizar el rol',
            };
        }

        revalidatePath('/dashboard/users');

        return {
            ok: true,
            message: 'Roles actualizados correctamente',
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'No se pudo actualizar el rol',
        };
    }
}
