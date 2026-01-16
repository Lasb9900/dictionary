'use client'

import { SendMessage } from "@/src/app/dictionary/actions/send-message";
import ChatResponseDisplay from "@/src/dictionary/components/ChatResponseDisplay";
import { ArrowRight, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Message {
    role: 'user' | 'assistant';
    content?: string;
    query?: string;
    data?: {
        type: 'biography' | 'comparison' | 'list' | 'similarity' | 'multimedia' | 'model' | 'summary';
        query: string;
        result: any;
    }
}

export const ChatDemonstrationSection = () => {
    const [demoQuestionAsked, setDemoQuestionAsked] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const dictionaryId = process.env.NEXT_PUBLIC_DICTIONARY_ID;

    const handleSend = async (content: string) => {
        if (content.trim() && !demoQuestionAsked) {
            if (!dictionaryId) {
                setChatError('No se encontró el diccionario. Vuelve atrás y selecciona uno.');
                return;
            }
            setDemoQuestionAsked(true); // Bloquear después de una pregunta
            const newMessage: Message = { role: 'user', content };
            setMessages(prev => [...prev, newMessage]);
            setIsLoading(true);
            try {
                const response = await SendMessage(dictionaryId, content);
                if (response?.error) {
                    setChatError(response.error);
                    return;
                }
                if (response) {
                    const formattedResponse = response.parsedResponse;
                    const assistantMessage: Message = {
                        role: 'assistant',
                        query: formattedResponse.query,
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
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="max-w-[1420px] h-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-18">
            <div className="lg:text-center mb-10">
                <h2 className="text-base text-d-green font-semibold tracking-wide uppercase text-center">Demostración</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Descubre el poder de nuestro agente literario
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                    Haz una pregunta sobre literatura del estado Bolívar.
                </p>
            </div>

            <div className="bg-green-50 dark:bg-[#2D2D2D] shadow-md sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }}>
                        <div className="mt-1 flex rounded-md shadow-sm ">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta aquí..."
                                className="flex-1 rounded-none rounded-l-md focus:border-d-green text-black focus:ring-0 focus:outline-none"
                                disabled={demoQuestionAsked || isLoading || !dictionaryId}
                            />
                            <button
                                type="submit"
                                className="px-3 relative inline-flex items-center rounded-r-md bg-d-green"
                                disabled={isLoading || demoQuestionAsked || !dictionaryId}
                            >
                                {isLoading ?
                                    <div className='flex text-base text-white font-semibold items-center'>
                                        <span>Enviar</span>
                                        <img src="/assets/loading (1).png" alt="show-password-icon" className='animate-spin ml-4' />
                                    </div>
                                    :
                                    <div className='flex text-base text-white font-semibold items-center'>
                                        <span>Enviar</span>
                                        <Send className="ml-2 h-5 w-5" />
                                    </div>
                                }
                            </button>
                        </div>
                    </form>
                    {chatError && (
                        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900">
                            {chatError}
                        </div>
                    )}
                    {messages.length > 0 && !isLoading && (
                        <div className="mt-4 p-4 bg-white dark:bg-[#2D2D2D] rounded-md">
                            {messages
                                .filter((message) => message.role === 'assistant') // Filtrar solo las respuestas del asistente
                                .map((message, index) => (
                                    <div key={index} className="mb-4 flex items-start">
                                        <div className="my-4 max-w-full inline-block px-4 mt-1 bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-gray-100">
                                            {message.data && (
                                                <ChatResponseDisplay data={message.data} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {demoQuestionAsked && !isLoading && (
                                <Link href={dictionaryId ? `/dictionary/${dictionaryId}/chat` : '/dictionary/chat'} >
                                    <button
                                        className="mt-4 flex items-center text-d-green-dark dark:text-d-green-light hover:underline"
                                    >
                                        Para continuar haciendo preguntas, dirígete a nuestra página principal del chat.
                                        <ArrowRight className="ml-2 h-5 w-5 animate-wiggleX" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
