'use server'

import { apiFetch } from '@/src/lib/api';
import { AuthorFormValues } from "@/src/forms/components/AuthorFormComponents/interfaces/AuthorForm";
import { authOptions } from "@/utils/config/authOptions";
import { getServerSession } from "next-auth";



export const loadAuthorForm = async (payload: AuthorFormValues, authorId: string | string[]) => {
    const session = await getServerSession(authOptions);

    // if (!session?.user.roles.includes('admin' || 'editor')) {
    //     return {
    //         ok: false,
    //         message: 'No tienes permisos para realizar esta acción',
    //     };
    // }

    try {
        console.log('autor', authorId)
        const response = await apiFetch(`/cards/update/author/${authorId}`, {
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
