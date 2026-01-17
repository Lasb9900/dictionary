'use client'

import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { WorkSheetCreator } from "../WorkSheetCreator/WorkSheetCreator"
import { WorkSheetProfile } from "../WorkSheetsProfile/WorkSheetProfile"
import { DocumentTextIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { ButtonWithPointLeft } from "@/src/components/ButtonWithPointLeft/ButtonWithPointLeft";
import { ObservationText } from '../ObservationText/ObservationText';
import { NewWorkSheetModal } from "../NewWorkSheetModal/NewWorkSheetModal"; // Importar el modal
import { useState, useTransition } from "react";
import DeleteModal from "@/src/users/components/DeleteModal/DeleteCardModal";
import { deleteCard } from "../../actions/delete-worksheet";
import { autoReviewSheet } from "@/src/app/dashboard/worksheets/actions/auto-review";
import { autoUploadSheet } from "@/src/app/dashboard/worksheets/actions/auto-upload";
import { rejectSheet } from "@/src/app/dashboard/worksheets/actions/reject";
import { markPendingEditSheet } from "@/src/app/dashboard/worksheets/actions/mark-pending-edit";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react'

interface User {
    _id: string,
    fullName: string,
    email: string,
    imageUrl: string,
}

interface Props {
    workSheetObservation: string,
    workSheetStatus: string,
    workSheetId: string,
    workSheetDate: string;
    workSheetName: string;
    workSheetType: string;
    editors: User[];
    reviewers: User[];
    buttonBackground: string;
    buttonPointStyle: string;
    buttonTextColor: string;
    buttonTitle: string;
}
interface WorkSheetAction {
    id: string;
    name: string;
    Icon: React.ElementType;
    role: string;
}

const workSheetsActions: WorkSheetAction[] = [
    { id: '01', name: 'Visualizar', Icon: EyeIcon, role: 'reviewer' },
    { id: '02', name: 'Formulario', Icon: DocumentTextIcon, role: 'editor' },
    { id: '03', name: 'Editar', Icon: PencilSquareIcon, role: 'admin' },
    { id: '04', name: 'Eliminar', Icon: TrashIcon, role: 'admin' },
];

export const WorkSheetFile = ({
    workSheetObservation,
    workSheetStatus,
    workSheetId,
    workSheetName,
    workSheetDate,
    workSheetType,
    editors,
    reviewers,
    buttonBackground,
    buttonPointStyle,
    buttonTextColor,
    buttonTitle,
}: Props) => {

    const { data: session } = useSession();
    const pathName = usePathname();
    const router = useRouter();
    const isAdmin = session?.user?.roles.includes('admin');

    const [openEditModal, setOpenEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState<any>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    let filteredActions: WorkSheetAction[];

    // Si es admin, mostrar todas las acciones
    if (isAdmin) {
        // Admin specific logic
        switch (pathName) {
            case '/dashboard/worksheets/validatedSheets':
            case '/dashboard/worksheets/rejectedSheets':
                // Include all actions for these paths
                filteredActions = workSheetsActions;
                break;
            case '/dashboard/worksheets/sheetsToComplete':
                // Exclude 'Visualizar' action
                filteredActions = workSheetsActions.filter(action => action.name !== 'Visualizar');
                break;
            case '/dashboard/worksheets/sheetsToReview':
                // Exclude 'Formulario' action
                filteredActions = workSheetsActions.filter(action => action.name !== 'Formulario');
                break;
            default:
                // Handle other admin paths or set to empty array
                filteredActions = [];
                break;
        }
    } else {
        // Si el usuario no es admin, filtramos las opciones según el pathname
        if (pathName === '/dashboard/worksheets/sheetsToComplete') {
            filteredActions = workSheetsActions.filter(action => action.role === 'editor');
        } else if (pathName === '/dashboard/worksheets/sheetsToReview') {
            filteredActions = workSheetsActions.filter(action => action.role === 'reviewer');
        } else {
            // Si el path es otro, podrías manejarlo de otra forma o dejar las opciones vacías
            filteredActions = [];
        }
    }

    const handleDeleteWorkSheet = async () => {
        try {
            const response = await deleteCard(workSheetId);

            if (response.ok) {
                return true;
            } else {
                console.error(response.message);
                return false;
            }
        } catch (error) {
            console.error("Error al eliminar la ficha:", error);
            return false;
        }
    };

    const handleClickActions = (workSheetType: string, action: string, id: string, status: string) => {
        // Manejando acciones de tipo 'formulario'
        if (action === '02') {
            switch (workSheetType) {
                case 'AuthorCard':
                    router.push(`/dashboard/forms/authorForm/${id}/authorDetails`);
                    break;
                case 'AnthologyCard':
                    router.push(`/dashboard/forms/anthologyForm/${id}/anthologyDetails`);
                    break;
                case 'GroupingCard':
                    router.push(`/dashboard/forms/groupingForm/${id}/groupingDetails`);
                    break;
                case 'MagazineCard':
                    router.push(`/dashboard/forms/magazineForm/${id}/magazineDetails`);
                    break;
                default:
                    console.error('Tipo de ficha no soportado para formularios');
            }
        } else if (action === '01') {
            switch (workSheetType) {
                case 'AuthorCard':
                    router.push(`/dashboard/workSheetReview/${id}/${status}/authorReview`);
                    break;
                case 'AnthologyCard':
                    router.push(`/dashboard/workSheetReview/${id}/${status}/anthologyReview`);
                    break;
                case 'GroupingCard':
                    router.push(`/dashboard/workSheetReview/${id}/${status}/groupingReview`);
                    break;
                case 'MagazineCard':
                    router.push(`/dashboard/workSheetReview/${id}/${status}/magazineReview`);
                    break;
                default:
                    console.error('Tipo de ficha no soportado para formularios');
            }
        } else if (action === "03") {
            // Abrir modal con los datos existentes para edición
            setOpenEditModal(true);
            setEditModalData({
                id,
                title: workSheetName,
                workSheetType: workSheetType,
                editors: editors.map((e) => e._id),
                reviewers: reviewers.map((r) => r._id),
            });
        } else if (action === "04") {
            setOpenDeleteModal(true);
        }
    };

    const handleMissingFields = (missingFields?: string[]) => {
        if (missingFields && missingFields.length > 0) {
            alert(`Faltan: ${missingFields.join(', ')}`);
        }
    };

    const handleActionError = (message?: string) => {
        alert(message || 'No se pudo completar la acción');
    };

    const handlePromptObservation = (label: string) => {
        const observation = prompt(label);
        if (!observation || observation.trim().length === 0) {
            return null;
        }
        return observation.trim();
    };

    const handleIaAction = (action: 'autoReview' | 'autoUpload' | 'reject' | 'markPendingEdit') => {
        startTransition(() => {
            void (async () => {
                let response:
                    | Awaited<ReturnType<typeof autoReviewSheet>>
                    | Awaited<ReturnType<typeof autoUploadSheet>>
                    | Awaited<ReturnType<typeof rejectSheet>>
                    | Awaited<ReturnType<typeof markPendingEditSheet>>;

                if (action === 'autoReview') {
                    response = await autoReviewSheet(workSheetType, workSheetId);
                } else if (action === 'autoUpload') {
                    response = await autoUploadSheet(workSheetType, workSheetId);
                } else if (action === 'reject') {
                    const observation = handlePromptObservation('Ingresa la observación del rechazo');
                    if (!observation) {
                        return;
                    }
                    response = await rejectSheet(workSheetId, observation);
                } else {
                    const observation = handlePromptObservation('Ingresa la observación para reabrir la ficha');
                    if (!observation) {
                        return;
                    }
                    response = await markPendingEditSheet(workSheetId, observation);
                }

                handleMissingFields((response as { data?: { missingFields?: string[] } })?.data?.missingFields);

                if (!response.ok) {
                    handleActionError(response.message);
                    return;
                }

                router.refresh();
            })();
        });
    };

    return (
        <div className='flex flex-col my-3 lg:my-4'>
            <div className={`flex-col min-w-[308px] max-w-[360px] lg:w-full lg:flex lg:flex-row lg:max-w-none lg:justify-between  bg-white py-4 xl:py-5 px-5 xl:px-6 items-center ${workSheetObservation !== '' ? 'rounded-t-md' : 'rounded-md'}`}>
                <div className="flex mb-2 justify-between lg:hidden">
                    <ButtonWithPointLeft title={buttonTitle} textColor={buttonTextColor} backgroundColor={buttonBackground} pointColor={buttonPointStyle} />
                    <Menu as="div" className='relative'>
                        <MenuButton>
                            <EllipsisHorizontalIcon className="w-7 h-7 text-d-gray-text" />
                        </MenuButton>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10  w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            {filteredActions && filteredActions.map((item) => (
                                <MenuItem key={item.name}>
                                    <div
                                        role="button"
                                        className="flex space-x-3 px-3 py-1 text-sm leading-6"
                                        onClick={() => handleClickActions(workSheetType, item.id, workSheetId, workSheetStatus)}
                                    >
                                        {item.Icon && <item.Icon className={`h-5 w-5 ${item.name === 'Eliminar' ? 'text-red-500' : 'text-d-gray-text'}`} />}
                                        <span className="text-gray-700 data-[focus]:bg-gray-50"> {item.name} </span>
                                    </div>
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </Menu>
                </div>
                {workSheetStatus !== 'Validated' && (
                    <div className="flex flex-wrap gap-2 pb-3 lg:hidden">
                        {workSheetStatus === 'Pending Edit' && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIaAction('autoReview')}
                                className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                            >
                                🤖 IA
                            </button>
                        )}
                        {workSheetStatus === 'Pending Review' && (
                            <>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleIaAction('autoUpload')}
                                    className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                                >
                                    📤 Publicar
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleIaAction('reject')}
                                    className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-red ${isPending ? 'opacity-50' : ''}`}
                                >
                                    ❌ Rechazar
                                </button>
                            </>
                        )}
                        {workSheetStatus === 'Rejected' && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIaAction('markPendingEdit')}
                                className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-gray-text ${isPending ? 'opacity-50' : ''}`}
                            >
                                ♻️ Reabrir
                            </button>
                        )}
                    </div>
                )}
                <div className="flex flex-col lg:contents">
                    <WorkSheetCreator workSheeetName={workSheetName} workSheeetDate={workSheetDate} workSheeetType={workSheetType} />
                    <div className="flex flex-col">
                        {
                            editors.map((editor) => (
                                <WorkSheetProfile key={editor._id} userImg={editor.imageUrl} userName={editor.fullName} userRol="Editor" />
                            ))
                        }
                    </div>

                    <div className="flex flex-col">
                        {
                            reviewers.map((reviewer) => (
                                <WorkSheetProfile key={reviewer._id} userImg={reviewer.imageUrl} userName={reviewer.fullName} userRol="Revisor" />
                            ))
                        }
                    </div>

                </div>
                <div className="hidden lg:flex items-center gap-3">
                    <ButtonWithPointLeft title={buttonTitle} textColor={buttonTextColor} backgroundColor={buttonBackground} pointColor={buttonPointStyle} />
                    {workSheetStatus !== 'Validated' && (
                        <div className="flex items-center gap-2">
                            {workSheetStatus === 'Pending Edit' && (
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleIaAction('autoReview')}
                                    className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                                >
                                    🤖 IA
                                </button>
                            )}
                            {workSheetStatus === 'Pending Review' && (
                                <>
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleIaAction('autoUpload')}
                                        className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                                    >
                                        📤 Publicar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleIaAction('reject')}
                                        className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-red ${isPending ? 'opacity-50' : ''}`}
                                    >
                                        ❌ Rechazar
                                    </button>
                                </>
                            )}
                            {workSheetStatus === 'Rejected' && (
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleIaAction('markPendingEdit')}
                                    className={`rounded-full px-3 py-1 text-sm font-medium text-white bg-d-gray-text ${isPending ? 'opacity-50' : ''}`}
                                >
                                    ♻️ Reabrir
                                </button>
                            )}
                        </div>
                    )}
                    <Menu as="div" className='relative'>
                        <MenuButton>
                            <EllipsisHorizontalIcon className="w-7 h-7 text-d-gray-text" />
                        </MenuButton>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10  w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            {filteredActions && filteredActions.map((item) => (
                                <MenuItem key={item.name}>
                                    <div
                                        role="button"
                                        className="flex hover:bg-gray-200 space-x-3 px-3 py-1 text-sm leading-6"
                                        onClick={() => handleClickActions(workSheetType, item.id, workSheetId, workSheetStatus)}
                                    >
                                        {item.Icon && <item.Icon className={`h-5 w-5 ${item.name === 'Eliminar' ? 'text-red-500' : 'text-d-gray-text'}`} />}
                                        <span className="text-gray-700 data-[focus]:bg-gray-50"> {item.name} </span>
                                    </div>
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </Menu>

                </div>
                {/* Modal para editar la ficha */}
                {openEditModal && (
                    <NewWorkSheetModal onClose={() => setOpenEditModal(false)} initialData={editModalData} />
                )}

                {/* Modal para eliminar la ficha */}
                {openDeleteModal && (
                    <DeleteModal
                        onClose={() => setOpenDeleteModal(false)}
                        onDelete={handleDeleteWorkSheet}
                    />
                )}
            </div>

            {workSheetObservation && (
                <ObservationText observation={workSheetObservation} />
            )}
        </div>
    )
}
