'use server'

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";

interface GetUsersByRoleProps {
    type: string;
    excludeIds: string[];
}

export const getUsersByRole = async ({ type, excludeIds = [] }: GetUsersByRoleProps) => {

    const session = await getServerSession(authOptions);

    if (!session?.user.roles.includes('admin')) {
        return {
            ok: false,
            message: 'No tienes permisos para realizar esta acción',
        };
    }

    try {
        const response = await apiFetch(`/users/find-by-role?type=${type}&excludeIds=${excludeIds.join(', ')}`, {
            method: 'GET',
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'No se pudo obtener los usuarios',
            };
        }

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'No se pudo actualizar el rol',
        };
    }
}
