'use server';

import { apiFetch } from '@/src/lib/api';
import { authOptions } from '@/utils/config/authOptions';
import { getServerSession } from 'next-auth';

export const autoUploadWorksheet = async (type: string, id: string, provider?: string) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return {
                ok: false,
                message: 'El usuario debe estar autenticado para realizar esta acción',
            };
        }

        const response = await apiFetch(`/ingestion/${type}/${id}/auto-upload`, {
            method: 'POST',
            headers: provider ? { 'x-ai-provider': provider } : undefined,
        });

        if (!response.ok) {
            return {
                ok: false,
                message: response.message || 'No se pudo ejecutar el auto-upload',
            };
        }

        return {
            ok: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error al ejecutar auto-upload:', error);
        return {
            ok: false,
            message: 'No se pudo ejecutar el auto-upload',
        };
    }
};
