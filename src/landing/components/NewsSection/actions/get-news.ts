'use server'

let hasLoggedNewsError = false;

type NewsResult = {
    items: any[];
    error?: string;
};

export async function getNews(): Promise<NewsResult> {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    if (!apiKey) {
        return { items: [], error: 'Noticias no disponibles' };
    }

    const url = `https://newsapi.org/v2/everything?qInTitle=literatura&language=es&sortBy=relevancy&apiKey=${apiKey}`;

    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 },
        });
        const data = await response.json();

        if (!response.ok) {
            if (!hasLoggedNewsError && process.env.NODE_ENV !== 'production') {
                console.warn('Error al obtener las noticias:', data.message || response.statusText);
                hasLoggedNewsError = true;
            }
            return { items: [], error: 'Noticias no disponibles' };
        }

        // Filtrar las noticias por fuentes específicas y palabras clave
        const filteredNews = data.articles.filter((article: any) =>
            article?.source?.name === "Muyinteresante.com" ||
            article?.source?.name === "Noticiaslatam.lat" ||
            article?.title?.includes("Venezuela") ||
            article?.description?.includes("Venezuela")
        );

        return { items: filteredNews };
    } catch (error: any) {
        if (!hasLoggedNewsError && process.env.NODE_ENV !== 'production') {
            console.warn('Error al obtener las noticias:', error.message);
            hasLoggedNewsError = true;
        }
        return { items: [], error: 'Noticias no disponibles' };
    }
}
