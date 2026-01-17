'use server';

import { apiFetch } from '@/src/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/config/authOptions';

// Tipo común para multimedia
interface Multimedia {
  images: { link: string; description: string }[];
  videos: { link: string; description: string }[];
  audios: { link: string; description: string }[];
  documents: { link: string; description: string }[];
}

interface Summary {
  title: string;
  text: string;
}

interface Model {
  text: string;
}

type ApiType =
  | 'biography'
  | 'list'
  | 'similarity'
  | 'comparison'
  | 'multimedia'
  | 'model'
  | 'summary';

interface ApiResponse {
  type: ApiType;
  query: string;
  result: any;
}

export const SendMessage = async (
  dictionaryId: string | undefined,
  question: string | string[],
) => {
  const resolvedDictionaryId = dictionaryId ?? process.env.NEXT_PUBLIC_DICTIONARY_ID;

  if (!resolvedDictionaryId) {
    return { error: 'No se encontró el diccionario. Vuelve atrás y selecciona uno.' };
  }

  // ✅ token del backend (session.accessToken)
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return { error: 'Sesión inválida o expirada. Inicia sesión nuevamente.' };
  }

  const response = await apiFetch<ApiResponse>(`/dictionary/${resolvedDictionaryId}/ask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // ✅ PASA OBJETO: apiFetch lo stringifea por dentro
    body: { question } as any,
  });

  if (!response.ok) {
    const fallbackMessage =
      response.status === 404
        ? 'Chat no disponible: backend no expone endpoint /dictionary/:id/ask'
        : response.status === 401
          ? 'Unauthorized (401): el backend rechazó el token. Vuelve a iniciar sesión.'
          : response.message.includes('NEXT_PUBLIC_API_BASE_URL')
            ? response.message
            : 'No se pudo procesar la solicitud del chat';

    return { error: fallbackMessage };
  }

  const parsedResponse = handleApiResponse(response.data);
  return { parsedResponse };
};

// Soporta backend NUEVO (result objeto) y backend viejo (result string con JSON embebido)
const handleApiResponse = (responseData: any): { type: ApiType; query: string; result: any } => {
  if (!responseData?.type) throw new Error('Formato de respuesta inválido: falta type');

  const type: ApiType = responseData.type;

  // model puede venir como string u objeto
  if (type === 'model') {
    const text =
      typeof responseData.result === 'string'
        ? responseData.result
        : JSON.stringify(responseData.result ?? {}, null, 2);

    const result: Model = { text };
    return { type, query: responseData.query ?? '', result };
  }

  // ✅ BACKEND NUEVO: result es objeto { dictionaryId, provider, answer, multimedia }
  if (responseData.result && typeof responseData.result === 'object' && !Array.isArray(responseData.result)) {
    const r = responseData.result;

    const multimedia: Multimedia = {
      images: Array.isArray(r?.multimedia?.images) ? r.multimedia.images : [],
      videos: Array.isArray(r?.multimedia?.videos) ? r.multimedia.videos : [],
      audios: Array.isArray(r?.multimedia?.audios) ? r.multimedia.audios : [],
      documents: Array.isArray(r?.multimedia?.documents) ? r.multimedia.documents : [],
    };

    const answerText =
      typeof r?.answer === 'string' ? r.answer : JSON.stringify(r?.answer ?? {}, null, 2);

    // Normalización mínima para tu UI actual
    if (type === 'summary') {
      const result: Summary = {
        title: 'Respuesta',
        text: answerText,
      };
      return { type, query: responseData.query ?? '', result };
    }

    // fallback para otros types por si luego los activas
    return {
      type,
      query: responseData.query ?? '',
      result: {
        title: 'Respuesta',
        text: answerText,
        multimedia,
      },
    };
  }

  // ✅ BACKEND VIEJO: result string con bloque JSON
  if (typeof responseData.result !== 'string') {
    throw new Error('Formato de respuesta inválido: result no es string ni objeto');
  }

  const jsonString = extractJsonBlock(responseData.result);
  if (!jsonString) throw new Error('No se encontró bloque JSON en result');

  const apiData = JSON.parse(jsonString);

  if (type === 'summary') {
    const result: Summary = {
      title: apiData.title ?? '',
      text: apiData.summary ?? apiData.text ?? '',
    };
    return { type, query: responseData.query ?? '', result };
  }

  // Si usas otros tipos legacy, aquí irían (tu código anterior)
  return { type, query: responseData.query ?? '', result: apiData };
};

const extractJsonBlock = (rawResult: string): string | null => {
  const fencedMatch = rawResult.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const jsonIndex = rawResult.toLowerCase().indexOf('json');
  if (jsonIndex === -1) return null;

  const braceStart = rawResult.indexOf('{', jsonIndex);
  const braceEnd = rawResult.lastIndexOf('}');
  if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) return null;

  return rawResult.slice(braceStart, braceEnd + 1).trim();
};
