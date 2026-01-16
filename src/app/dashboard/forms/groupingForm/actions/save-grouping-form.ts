'use server'

import { ingestionSave } from '@/src/actions/ingestion';
import { apiFetch } from '@/src/lib/api';
import { USE_INGESTION } from '@/src/lib/flags';
import { GroupingFormValues } from "@/src/forms/components/GroupingFormComponent/interfaces/GroupingForm";
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";


export const saveGroupingForm = async (payload: GroupingFormValues, groupingId: string | string[]) => {
    const session = await getServerSession(authOptions);

    // if (!session?.user.roles.includes('admin' || 'editor')) {
    //     return {
    //         ok: false,
    //         message: 'No tienes permisos para realizar esta acción',
    //     };
    // }

    try {
        const response = USE_INGESTION
            ? await ingestionSave('grouping', groupingId, payload)
            : await apiFetch(`/cards/save/grouping/${groupingId}`, {
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
