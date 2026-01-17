'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Send, PenSquare, Leaf, Brain, Lightbulb, Moon, Sun, ArrowLeft, UserPen, Bot, FileText, Pencil, Image } from 'lucide-react';
import { useTheme } from "next-themes";
import Loader from './Loader';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import ChatResponseDisplay from './ChatResponseDisplay';
import { SendMessage } from '@/src/app/dictionary/actions/send-message';
import { AlertProvider } from '@/src/users/context/AlertContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Define el tipo para cada mensaje
interface Message {
    role: 'user' | 'assistant';
    content?: string; // Para mensajes simples
    query?: string;   // Para incluir la consulta del usuario
    provider?: string;
    sources?: Source[];
    data?: { // Almacena la respuesta estructurada
        type: 'biography' | 'comparison' | 'list' | 'similarity' | 'multimedia' | 'model' | 'summary';
        query: string;
        result: any; // Este será un tipo más específico según el contenido
    }
}

interface Source {
    cardId?: string;
    cardType?: string;
    title?: string;
    url?: string;
}

interface ChatProps {
    cardId?: string;
    cardType?: string;
}

export default function Chat({ cardId, cardType }: ChatProps) {
    const isChatEnabled = process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [fichasPath, setFichasPath] = useState('');
    const [chatError, setChatError] = useState<string | null>(null);
    const [useCardContext, setUseCardContext] = useState(Boolean(cardId));
    const [name, setName] = useState('Investigador')
    const prueba = "json\n{\n  \"title\": \"Teresa Coraspe\",\n  \"text\": \"Teresa Coraspe vivió en Ciudad Bolívar durante la segunda mitad del siglo XX y la primera del siglo XXI.\",\n  \"multimedia\": {\n    \"images\": [\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg\",\n        \"description\": \"Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa \"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg\",\n        \"description\": \"Foto de Teresa en su casa\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg\",\n        \"description\": \"Foto de Teresa en su casa\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg\",\n        \"description\": \"Foto de Tereszxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxz xxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx xxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxx xxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxx xa en su casa\"\n      }\n    ],\n    \"videos\": [\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4\",\n        \"description\": \"Entrevista a Teresa Coraspe sobre su obra literaria\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4\",\n        \"description\": \"Documental sobre la vida de Teresa Coraspe\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4\",\n        \"description\": \"Conferencia de Teresa sobre poesía en Ciudad Bolívar\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4\",\n        \"description\": \"Evento en el cual Teresa discute sus escritos\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4\",\n        \"description\": \"Teresa hablando sobre los desafíos de ser una autora en su tiempo\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4\",\n        \"description\": \"Video homenaje a Teresa y su legado literario\"\n      }\n    ],\n    \"audios\": [\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg\",\n        \"description\": \"Entrevista sobre la vida personal de Teresa Coraspe\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/dmhvuwri2p9fhzlhs1kr.ogg\",\n        \"description\": \"Teresa leyendo un poema de su autoría\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/e0cfvuttkknxcqitp2js.ogg\",\n        \"description\": \"Discurso de Teresa sobre la importancia de la poesía en la sociedad\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/bq9lme77hwablsngrief.ogg\",\n        \"description\": \"Reflexión sobre la vida de los escritores de su época\"\n      }\n    ],\n    \"documents\": [\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/image/upload/v1728150241/Dictionary/Authors/fi7lh5jkdgjvwo6vjutu.pdf\",\n        \"description\": \"Biografía de Teresa Coraspe en formato PDF\"\n      },\n      {\n        \"link\": \"https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728150348/Dictionary/Authors/eyrddmcg9ynjawnzt3qi.docx\",\n        \"description\": \"Manuscrito de Teresa Coraspe en formato Word\"\n      }\n    ]\n  }\n}\n";

    type ResponseType = "biography" | "comparison" | "list" | "similarity" | "multimedia" | "model" | "summary";

    const prueba2: { type: ResponseType; query: string; result: any } = {
        type: 'biography', // Tipo de respuesta, puedes ajustarlo según sea necesario
        query: 'Información de Teresa Coraspe', // La consulta que generó esta respuesta, ajustable según el caso
        result: {
            title: "Teresa Coraspe",
            text: "Teresa Coraspe vivió en Ciudad Bolívar durante la segunda mitad del siglo XX y la primera del siglo XXI.",
            multimedia: {
                images: [
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                        description: "Foto de Teresa en su casa Foto de Teresa en su casa "
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                        description: "Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1728337394/Dictionary/Authors/xvdv5zknnnlou477qpbl.jpg",
                        description: "Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                        description: "Foto de Teresa en su casa"
                    }
                ],
                videos: [
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4",
                        description: "Entrevista a Teresa Coraspe sobre su obra literaria"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4",
                        description: "Documental sobre la vida de Teresa Coraspe"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4",
                        description: "Conferencia de Teresa sobre poesía en Ciudad Bolívar"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4",
                        description: "Evento en el cual Teresa discute sus escritos"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4",
                        description: "Teresa hablando sobre los desafíos de ser una autora en su tiempo"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4",
                        description: "Video homenaje a Teresa y su legado literario"
                    }
                ],
                audios: [
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg",
                        description: "Entrevista sobre la vida personal de Teresa Coraspe"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/dmhvuwri2p9fhzlhs1kr.ogg",
                        description: "Teresa leyendo un poema de su autoría"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/e0cfvuttkknxcqitp2js.ogg",
                        description: "Discurso de Teresa sobre la importancia de la poesía en la sociedad"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/bq9lme77hwablsngrief.ogg",
                        description: "Reflexión sobre la vida de los escritores de su época"
                    }
                ],
                documents: [
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1728150241/Dictionary/Authors/fi7lh5jkdgjvwo6vjutu.pdf",
                        description: "Biografía de Teresa Coraspe en formato PDF"
                    },
                    {
                        link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728150348/Dictionary/Authors/eyrddmcg9ynjawnzt3qi.docx",
                        description: "Manuscrito de Teresa Coraspe en formato Word"
                    }
                ]
            }
        }
    };

    const pruebaList: { type: ResponseType; query: string; result: any } = {
        type: 'list', // Tipo de respuesta, puedes ajustarlo según sea necesario
        query: 'Información de Teresa Coraspe',
        result: {
            "title": "Obras de Teresa Coraspe",
            "items": [
                {
                    "title": "Las fieras se dan golpes de pecho",
                    "text": "La obra \"Las fieras se dan golpes de pecho\" es un poemario escrito en español, publicado en el año 1975 por la Editorial Talavera en Ciudad Bolívar. Pertenece al género de la poesía y se caracteriza por retratar la cotidianidad con sus aspectos más oscuros y secundarios, como las soledades tumultuosas, los desamores y amores marcados por horarios, y las batallas silenciosas contra las vibraciones ordinarias de la vida diaria. Hasta el momento, no se han registrado ediciones adicionales de la obra.",
                    "multimedia": {
                        "images": [
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                                description: "Foto de Teresa en su casa Foto de Teresa en su casa "
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                                description: "Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1728337394/Dictionary/Authors/xvdv5zknnnlou477qpbl.jpg",
                                description: "Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa Foto de Teresa en su casa"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg",
                                description: "Foto de Teresa en su casa"
                            }
                        ],
                        "videos": [],
                        "audios": [],
                        "documents": [
                            {
                                "link": "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728051986/2_Un_diccionario_de_lo_nuestro_30-51_1_yfhyw8.pdf",
                                "description": "Diccionario de lo nuestro: una mirada a la literatura hispanoamericana."
                            }
                        ]
                    }
                },
                {
                    "title": "Vuelvo con mis huesos",
                    "text": "La obra \"Vuelvo con mis huesos\" es un poemario escrito en español, publicado en el año 1978 en Ciudad Bolívar por la Tipografía del Diario El Luchador. Pertenece al género de la poesía y se caracteriza por reflejar el dolor de abandonar algo propio y confrontar un destino inevitable. La voz poética se percibe despojada y sacrificada, especialmente en el atardecer, momento en el cual la tristeza la embarga. Hasta el momento, no se han registrado ediciones adicionales de esta obra.",
                    "multimedia": {
                        "images": [
                            {
                                "link": "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727808932/Coraspe_Vuelvo_con_mis_huesos_portada_srtgl4.jpg",
                                "description": "Portada de 'Vuelvo con mis huesos': un viaje introspectivo."
                            }
                        ],
                        "videos": [
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4",
                                description: "Entrevista a Teresa Coraspe sobre su obra literaria"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4",
                                description: "Documental sobre la vida de Teresa Coraspe"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4",
                                description: "Conferencia de Teresa sobre poesía en Ciudad Bolívar"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728052102/WhatsApp_Video_2024-07-29_at_09.07.13_iwwdjo.mp4",
                                description: "Evento en el cual Teresa discute sus escritos"
                            },
                        ],
                        "audios": [
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg",
                                description: "Entrevista sobre la vida personal de Teresa Coraspe"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/dmhvuwri2p9fhzlhs1kr.ogg",
                                description: "Teresa leyendo un poema de su autoría"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/e0cfvuttkknxcqitp2js.ogg",
                                description: "Discurso de Teresa sobre la importancia de la poesía en la sociedad"
                            },
                        ],
                        "documents": []
                    }
                },
                {
                    "title": "Vértice del círculo",
                    "text": "\"Vértice del círculo\" es una obra de poesía escrita en español y publicada en el año 1987 en Ciudad Bolívar por la Gobernación del Estado Bolívar. La obra pertenece al género de la poesía y se caracteriza por expresar la sensación de estar atrapado en una ciudad desconocida pero familiar, generando angustia y tristeza en la hablante. La ciudad se presenta como un entorno sin escapatoria, estrechamente vinculada al cuerpo y la mente de la protagonista, convirtiéndose en una presencia opresiva y constante en su vida. A pesar de la incomodidad que provoca, la voz poética logra convivir con la ciudad, percibiéndola como una entidad viva dentro de sí misma. Hasta el momento, no se han registrado ediciones adicionales de la obra.",
                    "multimedia": {
                        "images": [
                            {
                                "link": "https://res.cloudinary.com/dlhvylz4p/image/upload/v1727809103/V%C3%A9rtice_del_c%C3%ADrculo_Coraspe_portada_qeuvhd.jpg",
                                "description": "Portada de 'Vértice del círculo': explorando lo desconocido."
                            }
                        ],
                        "videos": [],
                        "audios": [
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg",
                                description: "Entrevista sobre la vida personal de Teresa Coraspe"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/dmhvuwri2p9fhzlhs1kr.ogg",
                                description: "Teresa leyendo un poema de su autoría"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/e0cfvuttkknxcqitp2js.ogg",
                                description: "Discurso de Teresa sobre la importancia de la poesía en la sociedad"
                            },
                        ],
                        "documents": [
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/image/upload/v1728150241/Dictionary/Authors/fi7lh5jkdgjvwo6vjutu.pdf",
                                description: "Biografía de Teresa Coraspe en formato PDF"
                            },
                            {
                                link: "https://res.cloudinary.com/dlhvylz4p/raw/upload/v1728150348/Dictionary/Authors/eyrddmcg9ynjawnzt3qi.docx",
                                description: "Manuscrito de Teresa Coraspe en formato Word"
                            }
                        ]
                    }
                }
            ]
        }
    }

    const pruebaComparison: { type: ResponseType; query: string; result: any } = {
        type: 'comparison', // Tipo de respuesta
        query: 'Comparación entre elementos literarios',
        result: {
            items: [
                {
                    title: 'Las fieras se dan golpes de pecho',
                    multimedia: {
                        images: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg',
                                description: 'Portada de Las fieras se dan golpes de pecho',
                            },
                        ],
                        videos: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4',
                                description: 'Entrevista sobre la obra "Las fieras se dan golpes de pecho"',
                            },
                        ],
                        audios: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg',
                                description: 'Lectura de un poema de "Las fieras se dan golpes de pecho"',
                            },
                        ],
                    },
                },
                {
                    title: 'Vuelvo con mis huesos',
                    multimedia: {
                        images: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/image/upload/v1727808932/Coraspe_Vuelvo_con_mis_huesos_portada_srtgl4.jpg',
                                description: 'Portada de Vuelvo con mis huesos',
                            },
                        ],
                        videos: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4',
                                description: 'Conferencia de Teresa Coraspe sobre "Vuelvo con mis huesos"',
                            },
                        ],
                        audios: [
                            {
                                link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/e0cfvuttkknxcqitp2js.ogg',
                                description: 'Entrevista sobre la temática de "Vuelvo con mis huesos"',
                            },
                        ],
                    },
                },
            ],
            text: 'Análisis comparativo entre las obras "Las fieras se dan golpes de pecho" y "Vuelvo con mis huesos", donde ambas exploran temáticas de dolor, soledad y la batalla interna de los personajes frente a su entorno. La primera obra se enfoca en la cotidianidad mientras que la segunda profundiza en el dolor del desarraigo.',
            title: 'Comparracion entre las obras vuelvo con mis huesos y vertice del circulo'
        },
    };

    const pruebaMultimedia: { type: ResponseType; query: string; result: any } = {
        type: 'multimedia', // Tipo de respuesta
        query: 'Dame la multimedia de teresa coraspe',
        result: {
            title: 'Las fieras se dan golpes de pecho',
            multimedia: {
                images: [
                    {
                        link: 'https://res.cloudinary.com/dlhvylz4p/image/upload/v1727805937/Teresa_Coraspe_ciwt8q.jpg',
                        description: 'Portada de Las fieras se dan golpes de pecho',
                    },
                ],
                videos: [
                    {
                        link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728086505/Dictionary/Authors/l7x5gzqarvfsq1llhee2.mp4',
                        description: 'Entrevista sobre la obra "Las fieras se dan golpes de pecho"',
                    },
                ],
                audios: [
                    {
                        link: 'https://res.cloudinary.com/dlhvylz4p/video/upload/v1728092963/Dictionary/Authors/ysuegjov5yxq8nik2yh1.ogg',
                        description: 'Lectura de un poema de "Las fieras se dan golpes de pecho"',
                    },
                ],
            },

        },
    };



    // Acceso al tema actual y a la función para cambiarlo
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (session) {
            const userName = session?.user.fullName
            setName(userName)
        }
        setMounted(true);
    }, []);

    // Función para hacer scroll hasta el final
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });

            // Agregar un delay para hacer que el desplazamiento sea más lento
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',  // Asegura que se mueva hacia el final
                });
            }, 2000); // Ajusta el tiempo aquí para hacerlo más lento
        }
    }

    // Forzar el scroll al final cuando cambian los mensajes o el estado de carga
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (content: string) => {
        if (content.trim()) {
            if (!isChatEnabled) {
                setChatError('El chat está deshabilitado en este entorno.');
                return;
            }
            const newMessage: Message = { role: 'user', content };
            setMessages(prev => [...prev, newMessage]);
            setInput('');
            setChatError(null);
            setLoading(true); // Inicia el estado de carga
            // Respuesta del servidor
            try {
                const response = await SendMessage({
                    question: content,
                    cardId: useCardContext ? cardId : undefined,
                    cardType: useCardContext ? cardType : undefined,
                });
                if (response?.error) {
                    setChatError(response.error);
                    return;
                }
                if (response) {
                    const formattedResponse = response.parsedResponse;
                    const assistantMessage: Message = {
                        role: 'assistant',
                        query: formattedResponse.query,
                        provider: formattedResponse.provider,
                        sources: formattedResponse.sources,
                        data: {
                            type: formattedResponse.type,
                            query: formattedResponse.query,
                            result: formattedResponse.result,
                        },
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                }
            } catch (error) {
                console.error("Error fetching response:", error);
                setChatError('No se pudo procesar la solicitud del chat.');
            } finally {
                setLoading(false);
            }
        }
    };


    const handleSendPrueba = async (content: string) => {
        if (content.trim()) {
            const newMessage: Message = { role: 'user', content };
            setMessages(prev => [...prev, newMessage]);
            setInput('');
            setLoading(true); // Inicia el estado de carga

            // Simulación de respuesta del servidor
            //const response = await SendMessage(content)
            if (pruebaMultimedia) {
                setTimeout(() => {
                    const formattedResponse = pruebaMultimedia;
                    const assistantMessage: Message = {
                        role: 'assistant',
                        query: formattedResponse.query,
                        data: {
                            type: formattedResponse.type,
                            query: formattedResponse.query,
                            result: formattedResponse.result // Aquí estamos almacenando el resultado completo
                        }
                    };
                    setMessages(prev => [
                        ...prev,
                        assistantMessage // Agrega el mensaje del asistente
                    ]);
                }, 2000);
            } else {
                console.error("Response is undefined");
            }
            setLoading(false);
        }
    };

    const suggestions = [
        { text: "¿Quién creó LetraScopio y cuál es su propósito?", icon: Bot, colorIcon: 'text-d-blue dark:text-d-fondo' },
        { text: "¿Quién es Oscar Pirrongeli y cuál es su legado en la literatura?", icon: UserPen, colorIcon: 'text-d-green' },
        { text: "¿Qué temas aborda la obra Vuelvo con mis huesos de Teresa Coraspe?", icon: FileText, colorIcon: 'text-d-yellow' },
        { text: "Quiero ver material multimedia (fotos, videos, audios) de Teresa Coraspe", icon: Image, colorIcon: 'text-d-red' },
    ];

    const [darkMode, setDarkMode] = useState(false);

    const hasCardContext = Boolean(cardId);

    const resolveSourceHref = (source: Source) => {
        if (source.url) return source.url;
        if (!source.cardId) return '/dashboard/worksheets/sheetsToComplete';
        switch (source.cardType) {
            case 'AuthorCard':
                return `/dashboard/forms/authorForm/${source.cardId}/authorDetails`;
            case 'AnthologyCard':
                return `/dashboard/forms/anthologyForm/${source.cardId}/anthologyDetails`;
            case 'GroupingCard':
                return `/dashboard/forms/groupingForm/${source.cardId}/groupingDetails`;
            case 'MagazineCard':
                return `/dashboard/forms/magazineForm/${source.cardId}/magazineDetails`;
            default:
                return `/dashboard/worksheets/sheetsToComplete`;
        }
    };

    const resolveSourceLabel = (source: Source, index: number) =>
        source.title || source.cardId || `Fuente ${index + 1}`;

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    useEffect(() => {
        // Si session es null o undefined, evita la actualización del estado
        if (!session) return;

        const { roles } = session.user;

        if (roles.includes('admin')) {
            setFichasPath('/dashboard/worksheets/validatedSheets');
        } else if (roles.includes('editor') && !roles.includes('reviewer')) {
            setFichasPath('/dashboard/worksheets/sheetsToComplete');
        } else if (roles.includes('reviewer') && !roles.includes('editor')) {
            setFichasPath('/dashboard/worksheets/sheetsToReview');
        } else if (roles.includes('editor') && roles.includes('reviewer')) {
            setFichasPath('/dashboard/worksheets/sheetsToComplete');
        } else {
            setFichasPath(''); // Opcional: Maneja el caso por defecto si es necesario
        }
    }, [session]);

    if (!mounted) return null;

    return (
        <AlertProvider>
            <div className="flex flex-col h-screen w-full mx-auto bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-gray-100">
                <div className="relative flex flex-col pl-2 max-sm:h-[60px] h-[80px] py-[2px] bg-cover bg-center bg-[url('/assets/bg-header-chat.png')] dark:bg-[url('/assets/header-oscuro.png')]">
                    <div className="flex-shrink-0 flex items-center">
                        <div className="relative flex flex-col pl-2 py-[2px] max-w-full">
                            <div className="flex items-center text-center space-x-0">
                                {/* Imagen que contiene las letras */}
                                <img
                                    src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730857447/Dictionary/Landing/Logo/obrxazplo9eu4rtzfngk.png"
                                    className="h-auto  max-sm:h-[55px] w-auto max-w-full max-h-[75px] dark:hidden" // Imagen para tema claro
                                    alt="Logo Light Mode"
                                />
                                <img
                                    src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730827012/Dictionary/Landing/Logo/l3etfqufly29esdimqtz.png"
                                    className="h-auto max-sm:h-[55px] w-auto max-w-full max-h-[75px] hidden dark:block" // Imagen para tema oscuro
                                    alt="Logo Dark Mode"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full h-[26px] bg-d-blue flex items-center justify-center'>
                    <ShieldCheckIcon className='h-4 w-4 text-white mr-1' />
                    <p className='font-mono text-xs text-gray-100'>
                        LetraScopio-preview
                    </p>
                </div>
                <div className='flex justify-between mx-6 mt-6'>
                    <div className="flex items-center">
                        <button
                            onClick={toggleTheme}
                            className={`relative flex items-center w-[154px] h-[40px] rounded-full p-1 transition-colors duration-300 focus:outline-none ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'
                                }`}
                        >
                            <span
                                className={`absolute text-xs font-medium transition-opacity duration-300 ${theme === 'light' ? 'left-12 opacity-100' : 'left-3 opacity-0'
                                    }`}
                            >
                                TEMA CLARO
                            </span>
                            <span
                                className={`absolute text-xs font-medium transition-opacity duration-300 ${theme === 'dark' ? 'right-12 opacity-100' : 'right-3 opacity-0'
                                    }`}
                            >
                                TEMA OSCURO
                            </span>
                            <span
                                className={`flex items-center justify-center w-[32px] h-[32px] rounded-full bg-white dark:bg-d-fondo shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-[112px]' : ''
                                    }`}
                            >
                                {theme === 'light' ? (
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-5 h-5 text-blue-500" />
                                )}
                            </span>
                        </button>
                    </div>
                    {session && (
                        <Link href={fichasPath}>
                            <button className="h-[40px] rounded-full bg-d-blue text-white dark:bg-d-fondo dark:text-gray-800 px-4 flex items-center space-x-2 hover:bg-blue-950 dark:hover:bg-d-gray-light transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span className='text-sm font-medium'>Dashboard</span>
                            </button>
                        </Link>
                    )}
                </div>
                {/* Select Theme */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[800px] mx-auto w-full h-full">
                        {!isChatEnabled && (
                            <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
                                El chat está deshabilitado en este entorno.
                            </div>
                        )}
                        {chatError && (
                            <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900">
                                {chatError}
                            </div>
                        )}
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-start h-full max-sm:mx-3">
                                <h1 className="text-4xl font-bold mb-4">
                                    <h1 className="max-sm:text-4xl text-6xl font-bold py-3 mb-2 text-center bg-gradient-to-r from-d-blue via-d-blue-light-button to-pink-500 text-transparent bg-clip-text" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        Hola, {name}
                                    </h1>
                                    <p className="max-sm:text-4xl text-6xl text-gray-400 dark:text-gray-500 mb-8 text-center font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        ¿En qué puedo ayudarte?
                                    </p>
                                </h1>

                                <div className="grid grid-cols-1 gap-4 max-w-[560px]">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="group relative h-12 w-full flex items-center justify-start rounded-lg shadow-lg bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 transition-all hover:scale-105 hover:shadow-2xl dark:hover:bg-gray-800 hover:bg-gray-100"
                                            onClick={() => handleSend(suggestion.text)}
                                        >
                                            <div className="flex items-center justify-start w-full mx-4">
                                                <suggestion.icon className={`max-sm:h-7 max-sm:w-7 h-6 w-6 mr-3 ${suggestion.colorIcon}`} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-normal text-left">{suggestion.text}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (

                            <div ref={messagesContainerRef} className='max-sm:mx-2'>
                                {messages.map((message, index) => (
                                    <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'items-start'}`}>
                                        {message.role === 'assistant' && (
                                            <div className="hidden sm:flex  w-8 h-8 rounded-full bg-d-blue dark:bg-d-fondo flex-shrink-0 items-center justify-center">
                                                <span className="text-white dark:text-gray-800 text-sm font-bold">LS</span>
                                            </div>
                                        )}
                                        <div className={`my-4 max-w-[800px] inline-block px-4 ${message.role === 'user'
                                            ? 'rounded-tl-2xl rounded-bl-2xl rounded-br-2xl py-3 bg-[#f4f4f4] text-gray-900 dark:bg-[#4A4A4A] dark:text-gray-100'
                                            : 'mt-1 bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-gray-100'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <span className='break-words'>{message.content}</span> // Muestra el contenido del mensaje del usuario
                                            ) : (
                                                <>
                                                    {message.provider && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            Proveedor: {message.provider}
                                                        </p>
                                                    )}
                                                    {message.data && <ChatResponseDisplay data={message.data} />}
                                                    {message.sources && message.sources.length > 0 && (
                                                        <div className="mt-4 rounded-md border border-gray-200 dark:border-gray-700 p-3">
                                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                                                Fuentes
                                                            </p>
                                                            <ul className="space-y-1">
                                                                {message.sources.map((source, sourceIndex) => (
                                                                    <li key={`${source.cardId ?? sourceIndex}`}>
                                                                        <Link
                                                                            className="text-sm text-d-blue hover:underline dark:text-d-yellow"
                                                                            href={resolveSourceHref(source)}
                                                                        >
                                                                            {resolveSourceLabel(source, sourceIndex)}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <Loader />
                                )}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-4  dark:border-gray-700 bg-white dark:bg-[#2D2D2D]">
                    <div className="mb-5 max-w-[800px] mx-auto w-full ">
                        {hasCardContext && (
                            <label className="mb-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={useCardContext}
                                    onChange={(event) => setUseCardContext(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-d-blue focus:ring-d-blue"
                                />
                                Usar contexto de la ficha actual
                            </label>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu mensaje aquí..."
                                className="w-full h-14 pl-6 pr-12 rounded-full bg-white dark:bg-[#333333]  dark:placeholder:text-[#B3B3B3] text-gray-900 dark:text-[#EAEAEA] border-0 dark:ring-[#4A4A4A] ring-1 ring-inset ring-gray-300"
                                disabled={loading || !isChatEnabled}
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent p-2"
                                disabled={loading || !isChatEnabled}
                            >
                                <Send className="h-5 w-5 text-gray-600 hover:text-gray-800 dark:text-[#B3B3B3] dark:hover:text-[#EAEAEA]" />
                                <span className="sr-only">Enviar</span>
                            </button>
                        </form>
                    </div>
                    <p className='flex items-center justify-center text-xs text-gray-500 dark:text-gray-400'>
                        Powered by&nbsp;<span className="font-semibold"> UCAB Guayana</span>
                    </p>
                </div>
            </div>
        </AlertProvider>
    );
}
