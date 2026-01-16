'use client'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';



// import required modules
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const handleScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
};

export const SwiperHero = () => {

    const { theme, setTheme } = useTheme();
    const [screenSize, setScreenSize] = useState('');

    // Verificar el tamaño de la pantalla y actualizar el estado
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1280) {
                setScreenSize('xl'); // Pantallas XL o mayores
            } else if (width >= 640 && width < 1280) {
                setScreenSize('sm-xl'); // Pantallas entre sm y xl
            } else {
                setScreenSize('sm'); // Pantallas menores a sm
            }
        };

        handleResize(); // Ejecutar al cargar
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Manejar el cambio de tema
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <section className="relative w-full max-h-[400px]">
            {/* Swiper de fondo */}
            <Swiper
                spaceBetween={30}
                effect={'fade'}
                autoplay={{
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                navigation={false}
                pagination={{
                    clickable: true,
                }}
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
                className="absolute inset-0 z-0 w-full max-h-[400px]"
            >

                {/* Mostrar slides según el tamaño de la pantalla */}
                {/* Renderizar los slides según el tamaño de la pantalla */}
                {screenSize === 'xl' ? (
                    <>
                        <SwiperSlide>
                            <img
                                className="w-full h-full object-cover bg-black/40"
                                src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730860584/Dictionary/Landing/SwiperHero/zihhmfflwm2rr5blqtu4.jpg"
                                alt="Nature-1"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                className="w-full h-full object-cover bg-black/40"
                                src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730860649/Dictionary/Landing/SwiperHero/mofygdb4rorgq9u7f9sc.jpg"
                                alt="Nature-2"
                            />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img
                                className="w-full h-full object-cover bg-black/40"
                                src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730859955/Dictionary/Landing/SwiperHero/w81oyqnjj8zlnukvlczl.jpg"
                                alt="Nature-3"
                            />
                        </SwiperSlide>
                    </>
                ) : screenSize === 'sm-xl' ? (
                    <SwiperSlide>
                        <img
                            className="w-full h-full object-cover bg-black/40"
                            src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730861557/Dictionary/Landing/SwiperHero/d26oegrkgrkj9c0twmsz.jpg"
                            alt="Nature-4"
                        />
                    </SwiperSlide>
                ) : (
                    // Opción para pantallas menores a sm
                    <SwiperSlide>
                        <img
                            className="w-full h-full object-cover bg-black/40"
                            src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730864423/Dictionary/Landing/SwiperHero/zicpaejfcqccae5msrpb.jpg"
                            alt="Nature-4"
                        />
                    </SwiperSlide>
                )}
                {/* Otros SwiperSlides opcionales */}
            </Swiper>

            {/* Contenido de texto superpuesto */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white bg-black/40">
                <div className="absolute m-4 top-0 left-0 sm:hidden items-center">
                    <button onClick={toggleTheme}>
                        <span>
                            {theme === 'light' ? (
                                <Sun className="w-6 h-6 text-yellow-500" />
                            ) : (
                                <Moon className="w-6 h-6 text-d-blue" />
                            )}
                        </span>
                    </button>
                </div>
                <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                    Explora la literatura con IA
                </h1>
                <p className="mt-3 max-sm:mx-4 max-w-md mx-auto text-base font-semibold sm:text-lg md:mt-5 md:text-2xl md:max-w-3xl">
                    Descubre nuevas perspectivas, analiza obras maestras y profundiza en el mundo de las letras con nuestro agente de IA especializado en literatura del estado Bolívar.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                    <div className="rounded-md shadow">
                        <Link href={process.env.NEXT_PUBLIC_DICTIONARY_ID ? `/dictionary/${process.env.NEXT_PUBLIC_DICTIONARY_ID}/chat` : '/dictionary/chat'}>
                            <button className="w-full text-white flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-d-blue transition-all hover:scale-105 hover:shadow-2xl md:py-4 md:text-lg md:px-10">
                                Comenzar ahora
                            </button>
                        </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <button
                            onClick={() => handleScroll('caracteristicas')}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-d-blue bg-white hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl md:py-4 md:text-lg md:px-10">
                            Saber más
                        </button>
                    </div>
                </div>
            </div>
        </section>



    );
}
