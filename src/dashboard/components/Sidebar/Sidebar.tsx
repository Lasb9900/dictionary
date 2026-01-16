"use client"
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from '@headlessui/react'
import {
    XMarkIcon,
    BookOpenIcon,
    DocumentMagnifyingGlassIcon,
    ClipboardDocumentListIcon,
    UserGroupIcon,
    ArrowDownTrayIcon,
    UserIcon,
    ArrowLeftStartOnRectangleIcon
} from '@heroicons/react/24/outline'
import { SidebarMenuItems } from '../SidebarMenuItems/SidebarMenuItems'
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';


interface Props {
    sendStatusSidebar: (status: boolean) => void;
    statusSidebar: boolean;
}





const userNavigation = [
    { name: 'Your profile', href: '#' },
    { name: 'Sign out', href: '#' },
]

export const Sidebar = ({ sendStatusSidebar, statusSidebar }: Props) => {

    const { data: session } = useSession();
    const isAdmin = session?.user?.roles.includes('admin');
    const dictionaryId = process.env.NEXT_PUBLIC_DICTIONARY_ID;
    const dictionaryPath = dictionaryId ? `/dictionary/${dictionaryId}/chat` : '/dictionary/chat';
    const isEditor = session?.user?.roles.includes('editor');
    const isEdOrRev = session?.user?.roles.includes('editor') || session?.user?.roles.includes('reviewer');
    const isReviewer = session?.user?.roles.includes('reviewer');
    const [fichasPath, setFichasPath] = useState('');

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

    const menuItems = [
        {
            path: fichasPath,
            title: 'Fichas',
            icon: <BookOpenIcon />,
        },
        {
            path: dictionaryPath,
            title: 'Buscador',
            icon: <DocumentMagnifyingGlassIcon />,
        },
        // {
        //     path: '/dashboard/notes',
        //     title: 'Bloc de notas',
        //     icon: <ClipboardDocumentListIcon />,
        // },
        {
            path: '/dashboard/users',
            title: 'Usuarios',
            icon: <UserGroupIcon />,
        },
        // {
        //     path: '/dashboard/downloads',
        //     title: 'Descargas',
        //     icon: <ArrowDownTrayIcon />,
        // },
        {
            path: '/dashboard/profile',
            title: 'Perfil',
            icon: <UserIcon />,
        },

    ]
    return (
        <>
            <div>
                <Dialog open={statusSidebar} onClose={sendStatusSidebar} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-d-fondo transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-700 ease-in-out data-[closed]:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-700 ease-in-out data-[closed]:opacity-0">
                                    <button type="button" onClick={() => sendStatusSidebar(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="h-6 w-6 text-d-blue" />
                                    </button>
                                </div>
                            </TransitionChild>

                            {/* Sidebar component */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-d-blue pb-4">
                                <div className="flex-shrink-0 flex items-center">
                                    <div className="relative flex flex-col pl-2 py-[2px] max-w-full">
                                        <div className="flex items-center text-center space-x-0">
                                            {/* Imagen que contiene las letras */}
                                            <img
                                                src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730827012/Dictionary/Landing/Logo/l3etfqufly29esdimqtz.png"
                                                className="h-auto w-auto max-w-full max-h-[65px] " // Ajusta la altura máxima según el diseño
                                            />
                                        </div>
                                    </div>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className=" space-y-5" >
                                                {isAdmin || isEdOrRev ?
                                                    (<SidebarMenuItems
                                                        key={menuItems[0].path}
                                                        onClick={() => sendStatusSidebar(false)}
                                                        {...menuItems[0]}
                                                    />
                                                    ) : null}
                                                <SidebarMenuItems
                                                    key={menuItems[1].path}
                                                    onClick={() => sendStatusSidebar(false)}
                                                    {...menuItems[1]}
                                                />
                                                <SidebarMenuItems
                                                    key={menuItems[2].path}
                                                    onClick={() => sendStatusSidebar(false)}
                                                    {...menuItems[2]}
                                                />
                                                {isAdmin ?
                                                    (<SidebarMenuItems
                                                        key={menuItems[3].path}
                                                        onClick={() => sendStatusSidebar(false)}
                                                        {...menuItems[3]}
                                                    />
                                                    ) : null}
                                                {/* <SidebarMenuItems
                                                    key={menuItems[4].path}
                                                    onClick={() => sendStatusSidebar(false)}
                                                    {...menuItems[4]}
                                                /> */}
                                                {/* <SidebarMenuItems
                                                    key={menuItems[5].path}
                                                    onClick={() => sendStatusSidebar(false)}
                                                    {...menuItems[5]}
                                                /> */}
                                            </ul>
                                        </li>
                                        <li className='mt-auto mb-3 px-5'>
                                            <ul
                                                className=""
                                            >
                                                <button
                                                    className='group flex gap-x-3 rounded-md text-md font-medium leading-6 text-indigo-200 hover:text-red-500'
                                                    onClick={() => signOut()}
                                                >
                                                    <ArrowLeftStartOnRectangleIcon
                                                        aria-hidden="true"
                                                        className="h-6 w-6 shrink-0 hover:text-red-500"
                                                    />
                                                    Cerrar Sesion
                                                </button>
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                    {/* Sidebar component */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-d-blue py-3">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="relative flex flex-col pl-2 py-[2px] max-w-full">
                                <div className="flex items-center text-center space-x-0">
                                    {/* Imagen que contiene las letras */}
                                    <img
                                        src="https://res.cloudinary.com/dlhvylz4p/image/upload/v1730827012/Dictionary/Landing/Logo/l3etfqufly29esdimqtz.png"
                                        className="h-auto w-auto max-w-full max-h-[65px] " // Ajusta la altura máxima según el diseño
                                    />
                                </div>
                            </div>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className=" space-y-5">
                                        {isAdmin || isEdOrRev ?
                                            (<SidebarMenuItems
                                                key={menuItems[0].path}
                                                onClick={() => sendStatusSidebar(false)}
                                                {...menuItems[0]}
                                            />
                                            ) : null}
                                        <SidebarMenuItems
                                            key={menuItems[1].path}
                                            onClick={() => sendStatusSidebar(false)}
                                            {...menuItems[1]}
                                        />
                                        {isAdmin ?
                                            (
                                                <>
                                                    <SidebarMenuItems
                                                        key={menuItems[2].path}
                                                        onClick={() => sendStatusSidebar(false)}
                                                        {...menuItems[2]}
                                                    />
                                                    <SidebarMenuItems
                                                        key={menuItems[3].path}
                                                        onClick={() => sendStatusSidebar(false)}
                                                        {...menuItems[3]}
                                                    />
                                                </>
                                            ) : null}
                                        {/* <SidebarMenuItems
                                            key={menuItems[4].path}
                                            onClick={() => sendStatusSidebar(false)}
                                            {...menuItems[4]}
                                        />
                                        <SidebarMenuItems
                                            key={menuItems[5].path}
                                            onClick={() => sendStatusSidebar(false)}
                                            {...menuItems[5]}
                                        /> */}
                                    </ul>
                                </li>
                                <li className="mt-auto pl-[14px]">
                                    <ul
                                        className=""
                                    >
                                        <button
                                            className='group flex gap-x-3 rounded-md p-2 text-md font-medium leading-6 text-indigo-200 hover:text-red-500'
                                            onClick={() => signOut()}
                                        >
                                            <ArrowLeftStartOnRectangleIcon
                                                aria-hidden="true"
                                                className="h-6 w-6 shrink-0 hover:text-red-500"
                                            />
                                            Cerrar Sesion
                                        </button>
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
}
