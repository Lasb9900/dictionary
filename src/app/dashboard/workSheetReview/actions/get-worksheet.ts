'use server'

import { apiFetch } from '@/src/lib/api';

export const GetWorksheet = async (id: string) => {
    try {
        const response = await apiFetch(`/cards/texts/${id}`, {
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
            data: response.data,  // Devolvemos los datos en una clave `data`
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            ok: false,
            message: 'Error al obtener los datos de la ficha',
        };
    }
};
