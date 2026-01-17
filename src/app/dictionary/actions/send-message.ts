import { apiFetch } from '@/src/lib/api';

// Tipo común para multimedia
interface Multimedia {
    images: { link: string; description: string }[];
    videos: { link: string; description: string }[];
    audios: { link: string; description: string }[];
    documents: { link: string; description: string }[];
}

// Caso para biography
interface BiographyResponse {
    title: string;
    text: string;
    multimedia: Multimedia;
}

// Caso para list (lista de obras, por ejemplo)
interface ListItem {
    title: string;
    text: string;
    multimedia: Multimedia;
}

interface ComparisonItem {
    title: string;
    multimedia: Multimedia;
}

interface ListResponse {
    title: string;
    items: ListItem[];
}

// Caso para comparison
interface ComparisonResponse {
    title: string;
    text: string;
    items: ComparisonItem[];
}

// Caso para multimedia
interface MultimediaResponse {
    title: string;
    multimedia: Multimedia;
}

interface Summary {
    title: string;
    text: string;
}

interface Model {
    text: string
}

// Definimos la interfaz que puede manejar tanto biography como list
interface ApiResponse {
    type: 'biography' | 'list' | 'similarity' | 'comparison' | 'multimedia' | 'model' | 'summary';
    query: string;
    result: BiographyResponse | ListResponse | ComparisonResponse | MultimediaResponse | Model | Summary;
}

export const SendMessage = async (dictionaryId: string | undefined, question: string | string[]) => {
    const resolvedDictionaryId = dictionaryId ?? process.env.NEXT_PUBLIC_DICTIONARY_ID;

    if (!resolvedDictionaryId) {
        return {
            error: 'No se encontró el diccionario. Vuelve atrás y selecciona uno.',
        };
    }

    try {
        const response = await apiFetch<ApiResponse>(`/dictionary/${resolvedDictionaryId}/ask`, {
            method: 'POST',
            body: { question },
        });

        if (!response.ok) {
            const fallbackMessage = response.status === 404
                ? 'Chat no disponible: backend no expone endpoint /dictionary/:id/ask'
                : response.message.includes('NEXT_PUBLIC_API_BASE_URL')
                    ? response.message
                    : 'No se pudo procesar la solicitud del chat';
            return { error: fallbackMessage };
        }

        // Procesamos la respuesta antes de devolverla
        const parsedResponse = handleApiResponse(response.data);

        return {
            parsedResponse,
        };
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        if (error instanceof Error && error.message === 'Missing NEXT_PUBLIC_API_BASE_URL') {
            return {
                error: error.message,
            };
        }
        return {
            error: 'No se pudo procesar la solicitud del chat.',
        };
    }
};

// Lógica para manejar la respuesta de la API
const handleApiResponse = (responseData: any): ApiResponse => {
    try {
        if (!responseData?.type || typeof responseData?.result !== 'string') {
            throw new Error('Formato de respuesta inválido');
        }

        // Manejar el caso para "model" con texto simple en result
        if (responseData.type === 'model' && typeof responseData.result === 'string') {
            return {
                type: responseData.type,
                query: responseData.query,
                result: {
                    text: responseData.result, // Usamos el texto directamente
                },
            };
        }

        // El backend envuelve el JSON en texto, por eso extraemos el bloque antes de parsear.
        const jsonString = extractJsonBlock(responseData.result);

        // Verificamos si el resultado contiene un bloque de código con el JSON
        if (jsonString) {
            // Parseamos el JSON contenido en esa cadena
            const apiData = JSON.parse(jsonString);

            // Verificamos el tipo de respuesta
            if (responseData.type === 'list' || responseData.type === 'similarity') {
                // Procesar tipo "list" o "similarity", que tiene un conjunto de "items"
                return {
                    type: responseData.type,
                    query: responseData.query,
                    result: {
                        title: apiData.title ?? '',
                        items: apiData.items?.map((item: any) => ({
                            title: item.title,
                            text: item.text,
                            multimedia: {
                                images: Array.isArray(item.multimedia?.images) ? item.multimedia.images : [],
                                videos: Array.isArray(item.multimedia?.videos) ? item.multimedia.videos : [],
                                audios: Array.isArray(item.multimedia?.audios) ? item.multimedia.audios : [],
                                documents: Array.isArray(item.multimedia?.documents) ? item.multimedia.documents : [],
                            },
                        })) ?? [],
                    },
                };
            } else if (responseData.type === 'biography') {
                // Procesar el tipo existente "biography"
                return {
                    type: responseData.type,
                    query: responseData.query,
                    result: {
                        title: apiData.title ?? '',
                        text: apiData.text ?? '',
                        multimedia: {
                            images: Array.isArray(apiData.multimedia?.images) ? apiData.multimedia.images : [],
                            videos: Array.isArray(apiData.multimedia?.videos) ? apiData.multimedia.videos : [],
                            audios: Array.isArray(apiData.multimedia?.audios) ? apiData.multimedia.audios : [],
                            documents: Array.isArray(apiData.multimedia?.documents) ? apiData.multimedia.documents : [],
                        },
                    },
                };
            }  else if (responseData.type === 'comparison') {
                // Procesar el tipo existente "comparison"
                return {
                    type: responseData.type,
                    query: responseData.query,
                    result: {
                        title: apiData.title ?? '',
                        text: apiData.text ?? '',
                        items: apiData.items?.map((item: any) => ({
                            title: item.title,
                            multimedia: {
                                images: Array.isArray(item.multimedia?.images) ? item.multimedia.images : [],
                                videos: Array.isArray(item.multimedia?.videos) ? item.multimedia.videos : [],
                                audios: Array.isArray(item.multimedia?.audios) ? item.multimedia.audios : [],
                                documents: Array.isArray(item.multimedia?.documents) ? item.multimedia.documents : [],
                            },
                        })) ?? [],
                    },
                };
            } else if (responseData.type === 'multimedia') {
                return {
                    type: responseData.type,
                    query: responseData.query,
                    result: {
                        title: apiData.title ?? '',
                        multimedia: {
                            images: Array.isArray(apiData.multimedia?.images) ? apiData.multimedia.images : [],
                            videos: Array.isArray(apiData.multimedia?.videos) ? apiData.multimedia.videos : [],
                            audios: Array.isArray(apiData.multimedia?.audios) ? apiData.multimedia.audios : [],
                            documents: Array.isArray(apiData.multimedia?.documents) ? apiData.multimedia.documents : [],
                        },
                    },
                };
            } else if (responseData.type === 'summary') {
                // Procesar el tipo existente "summary"
                return {
                    type: responseData.type,
                    query: responseData.query,
                    result: {
                        title: apiData.title ?? '',
                        text: apiData.summary ?? '',
                    },
                };
            } else {
                throw new Error('Tipo de respuesta no soportado');
            }
        } else {
            throw new Error('Formato de respuesta inválido');
        }
    } catch (error) {
        console.error('Error al procesar la respuesta de la API:', error);
        throw new Error('Error al procesar la respuesta de la API');
    }
};

const extractJsonBlock = (rawResult: string): string | null => {
    const fencedMatch = rawResult.match(/```json\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    const jsonIndex = rawResult.toLowerCase().indexOf('json');
    if (jsonIndex === -1) {
        return null;
    }

    const braceStart = rawResult.indexOf('{', jsonIndex);
    const braceEnd = rawResult.lastIndexOf('}');
    if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) {
        return null;
    }

    return rawResult.slice(braceStart, braceEnd + 1).trim();
};
