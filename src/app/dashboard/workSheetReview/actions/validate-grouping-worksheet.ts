'use server'

import { ingestionAutoReview, ingestionAutoUpload } from '@/src/actions/ingestion';
import { apiFetch } from '@/src/lib/api';
import { USE_INGESTION } from '@/src/lib/flags';
import { GroupingTextValues } from "@/src/worksheetsReview/interfaces/GroupingWorkSheetReview";
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";



export const ValidateGroupingWorkSheet = async (payload: GroupingTextValues, groupingId: string | string[]) => {
    const session = await getServerSession(authOptions);

    // if (!session?.user.roles.includes('admin' || 'reviewer')) {
    //     return {
    //         ok: false,
    //         message: 'No tienes permisos para realizar esta acción',
    //     };
    // }

    try {
        console.log(payload)
        if (USE_INGESTION) {
            const responseReview = await ingestionAutoReview('grouping', groupingId);
            if (!responseReview.ok) {
                console.error('Error al validar la ficha:', responseReview);
                return {
                    ok: false,
                    message: responseReview.message || 'No se pudo validar la ficha',
                };
            }

            const responseUpload = await ingestionAutoUpload('grouping', groupingId);
            if (!responseUpload.ok) {
                console.error('Error al validar la ficha:', responseUpload);
                return {
                    ok: false,
                    message: responseUpload.message || 'No se pudo validar la ficha',
                };
            }
        } else {
            const responseValidate = await apiFetch(`/cards/save-texts/${groupingId}`, {
                method: 'POST',
                body: { ...payload },
            });

            const responseNeo4j = await apiFetch(`/cards/upload/grouping/${groupingId}`, {
                method: 'PUT',
            });

            if (!responseValidate.ok) {
                console.error('Error al validar la ficha:', responseValidate);
                return {
                    ok: false,
                    message: responseValidate.message || 'No se pudo validar la ficha',
                };
            }

            if (!responseNeo4j.ok) {
                console.error('Error al validar la ficha:', responseNeo4j);
                return {
                    ok: false,
                    message: responseNeo4j.message || 'No se pudo validar la ficha',
                };
            }
        }

        revalidatePath('/dashboard/worksheets/validatedSheets');

        return {
            ok: true,
            message: 'Ficha validada correctamente',
        };
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return {
            ok: false,
            message: 'No se pudo realizar la acción',
        };
    }
};
