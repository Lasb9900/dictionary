'use client'

import { Newspaper } from "lucide-react"
import { useEffect, useState } from "react";
import { getNews } from "./actions/get-news";

const News = () => {
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [newsUnavailable, setNewsUnavailable] = useState(false);

    const customNews = {
        title: "LetraScopio: Próximo Lanzamiento con Innovación en Literatura e Inteligencia Artificial",
        description: "LetraScopio se prepara para lanzar su esperada versión de prueba en los próximos días. La plataforma promete revolucionar el acceso a la literatura del estado Bolívar con herramientas innovadoras.",
        urlToImage: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1729143682/Dictionary/Landing/Testimonials/ckqmt7skpz7p864iyk3z.png",
        publishedAt: new Date().toISOString().split('T')[0], // Fecha actual
        source: {
            id: null,
            name: "UCAB extensión Guayana"
        },
    };

    // Función para traer las noticias usando la server action
    const fetchNewsData = async () => {
        try {
            // Llama a la server action para obtener las noticias filtradas
            const fetchedNews = await getNews();
            setNewsUnavailable(Boolean(fetchedNews.error));

            // Combina la noticia personalizada con las noticias obtenidas
            setNewsItems([customNews, ...fetchedNews.items]);
        } catch (error) {
            console.error('Error al obtener las noticias:', error);
            setNewsUnavailable(true);
        }
    };

    useEffect(() => {
        fetchNewsData(); // Llama a la función que usa la server action
    }, []);

    return (
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-18">
            <div className="lg:text-center mb-10">
                <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-center">NOTICIAS</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Lo más reciente en literatura y LetraScopio
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                    Explora las últimas noticias y actualizaciones del mundo literario, junto con las novedades de nuestra plataforma.
                </p>
                {newsUnavailable && (
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
                        Sin noticias por ahora.
                    </p>
                )}
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
                {newsItems.map((item, index) => (
                    <div key={index} className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl">
                        <a href={item.url || '#'} target="_blank" rel="noopener noreferrer">
                            <div className="flex-shrink-0">
                                <img className="h-48 w-full object-cover" src={item.urlToImage} alt={item.title} />
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-700 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Noticia
                                    </p>
                                    <div className="block mt-2">
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                        <p className="mt-3 text-base text-gray-500 dark:text-gray-300">{item.description}</p>
                                        <p className="mt-2 text-base text-gray-500 dark:text-gray-300">Fuente: <span className="text-sm font-serif text-gray-400 dark:text-gray-300">{item.source.name}</span></p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="flex-shrink-0">
                                        <Newspaper className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Publicado el
                                        </p>
                                        <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-300">
                                            <time dateTime={item.publishedAt}>{item.publishedAt.split('T')[0]}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default News
