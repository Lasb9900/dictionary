'use server';

import { apiFetch } from '@/src/lib/api';
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

// Función para cargar los datos de agrupamiento
export const getMagazineForm = async (magazineId: string | string[]) => {
    const session = await getServerSession(authOptions);

    // Verificar que el usuario tenga los permisos correctos
    if (!session?.user.roles.includes('admin')) {
        return {
            ok: false,
            message: 'No tienes permisos para realizar esta acción',
        };
    }

    try {
        // Realizar la solicitud GET para obtener los datos de agrupamiento
        const response = await apiFetch(`/cards/magazine/${magazineId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error('Error al obtener los datos del agrupamiento:', response);
            return {
                ok: false,
                message: response.message || 'No se pudo obtener los datos del agrupamiento',
            };
        }
        revalidatePath(`/dashboard/forms/magazineForm/${magazineId}/magazineDetails`);
        return {
            responseData: response.data, // Devolvemos los datos obtenidos
        };
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return;
        // return {
        //     ok: false,
        //     message: 'No se pudo realizar la acción',
        // };
    }
};
