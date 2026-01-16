'use server'

import { ingestionSave } from '@/src/actions/ingestion';
import { apiFetch } from '@/src/lib/api';
import { USE_INGESTION } from '@/src/lib/flags';
import { MagazineFormValues } from "@/src/forms/components/MagazineFormComponents/interfaces/MagazineForm";
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";


export const saveMagazineForm = async (payload: MagazineFormValues, magazineId: string | string[]) => {
    const session = await getServerSession(authOptions);

    // if (!session?.user.roles.includes('admin' || 'editor')) {
    //     return {
    //         ok: false,
    //         message: 'No tienes permisos para realizar esta acción',
    //     };
    // }

    try {
        const response = USE_INGESTION
            ? await ingestionSave('magazine', magazineId, payload)
            : await apiFetch(`/cards/save/magazine/${magazineId}`, {
                method: 'PUT',
                body: { ...payload },
            });

        if (!response.ok) {
            console.error('Error al guardar el formulario de autor:', response);
            return {
                ok: false,
                message: response.message || 'No se pudo guardar el formulario del autor',
            };
        }

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
