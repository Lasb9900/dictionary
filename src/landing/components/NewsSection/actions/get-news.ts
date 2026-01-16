'use server'

type NewsResult = {
    items: any[];
    error?: string;
};

export async function getNews(): Promise<NewsResult> {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    if (!apiKey) {
        return { items: [], error: 'Sin noticias' };
    }

    const url = `https://newsapi.org/v2/everything?qInTitle=literatura&language=es&sortBy=relevancy&apiKey=${apiKey}`;

    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 },
        });
        const data = await response.json();

        if (!response.ok) {
            return { items: [], error: 'Sin noticias' };
        }

        // Filtrar las noticias por fuentes específicas y palabras clave
        const filteredNews = data.articles.filter((article: any) =>
            article.source.name === "Muyinteresante.com" ||
            article.source.name === "Noticiaslatam.lat" ||
            article.title.includes("Venezuela") ||
            article.description.includes("Venezuela")
        );

        return { items: filteredNews };
    } catch (error: any) {
        return { items: [], error: 'Sin noticias' };
    }
}
