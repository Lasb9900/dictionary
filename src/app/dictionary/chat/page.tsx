
import Link from "next/link";

export default function ChatPage() {
    const isChatEnabled = process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true';

    return (
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
                {isChatEnabled ? 'No se encontró el diccionario' : 'Chat deshabilitado'}
            </h1>
            <p className="mt-2 text-gray-600">
                {isChatEnabled
                    ? 'Vuelve atrás y selecciona un diccionario para continuar con el chat.'
                    : 'Activa NEXT_PUBLIC_ENABLE_CHAT para habilitar esta sección.'}
            </p>
            <Link
                href="/"
                className="mt-6 rounded-md bg-d-blue px-4 py-2 text-white hover:bg-blue-900"
            >
                Volver al inicio
            </Link>
        </div>
    );
}
