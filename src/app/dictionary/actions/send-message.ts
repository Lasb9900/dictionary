'use server';

import { apiFetch } from '@/src/lib/api';

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
  provider?: string;
  sources?: Source[];
}

interface Source {
  cardId?: string;
  cardType?: string;
  title?: string;
  url?: string;
}

interface SendMessagePayload {
  question: string | string[];
  cardId?: string;
  cardType?: string;
  provider?: string;
}

export const SendMessage = async ({ question, cardId, cardType, provider }: SendMessagePayload) => {
  const response = await apiFetch<ApiResponse>('/dictionary/ask', {
    method: 'POST',
    headers: provider ? { 'x-ai-provider': provider } : undefined,
    body: {
      question,
      cardId,
      cardType,
    },
  });

  if (!response.ok) {
    const fallbackMessage =
      response.status === 404
        ? 'Chat no disponible: backend no expone endpoint /dictionary/ask'
        : response.status === 401
          ? 'Unauthorized (401): el backend rechazó el token. Vuelve a iniciar sesión.'
          : response.message.includes('NEXT_PUBLIC_API_URL')
            ? response.message
            : 'No se pudo procesar la solicitud del chat';

    return { error: fallbackMessage };
  }

  const parsedResponse = handleApiResponse(response.data);
  return { parsedResponse };
};

// Soporta backend NUEVO (result objeto) y backend viejo (result string con JSON embebido)
const handleApiResponse = (
  responseData: any,
): { type: ApiType; query: string; result: any; provider?: string; sources?: Source[] } => {
  if (!responseData?.type) throw new Error('Formato de respuesta inválido: falta type');

  const type: ApiType = responseData.type;
  const provider = responseData.provider ?? responseData?.result?.provider ?? 'Gemini';
  const sources = Array.isArray(responseData.sources)
    ? responseData.sources
    : Array.isArray(responseData?.result?.sources)
      ? responseData.result.sources
      : undefined;

  // model puede venir como string u objeto
  if (type === 'model') {
    const text =
      typeof responseData.result === 'string'
        ? responseData.result
        : JSON.stringify(responseData.result ?? {}, null, 2);

    const result: Model = { text };
    return { type, query: responseData.query ?? '', result, provider, sources };
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
      return { type, query: responseData.query ?? '', result, provider, sources };
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
      provider,
      sources,
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
    return { type, query: responseData.query ?? '', result, provider, sources };
  }

  // Si usas otros tipos legacy, aquí irían (tu código anterior)
  return { type, query: responseData.query ?? '', result: apiData, provider, sources };
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
