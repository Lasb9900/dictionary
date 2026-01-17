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
import { useState } from "react";
import DeleteModal from "@/src/users/components/DeleteModal/DeleteCardModal";
import { deleteCard } from "../../actions/delete-worksheet";
import { autoReviewWorksheet } from "@/src/app/dashboard/worksheets/actions/auto-review-worksheet";
import { autoUploadWorksheet } from "@/src/app/dashboard/worksheets/actions/auto-upload-worksheet";
import { rejectWorksheet } from "@/src/app/dashboard/worksheets/actions/reject-worksheet";
import { reopenWorksheet } from "@/src/app/dashboard/worksheets/actions/reopen-worksheet";
import { ObservationModal } from "@/src/components/ObservationModal/ObservationModal";
import { useAlert } from "@/src/users/context/AlertContext";
import { getStoredAiProvider } from "@/src/ai/ai-provider";
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

const SUPPORTED_INGESTION_TYPES = new Set([
    'AuthorCard',
    'AnthologyCard',
    'GroupingCard',
    'MagazineCard',
    'MythAndLegendCard',
]);

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
    const { showAlert } = useAlert();

    const [openEditModal, setOpenEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState<any>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [observationModal, setObservationModal] = useState<null | 'reject' | 'reopen'>(null);

    const isPendingEdit = workSheetStatus === 'Pending Edit';
    const isPendingReview = workSheetStatus === 'Pending Review';
    const isRejected = workSheetStatus === 'Rejected';
    const isAiSupported = SUPPORTED_INGESTION_TYPES.has(workSheetType);

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

    const handleAutoReview = async () => {
        setIsSubmitting(true);
        const provider = getStoredAiProvider();
        const response = await autoReviewWorksheet(workSheetType, workSheetId, provider);
        setIsSubmitting(false);

        if (response.ok) {
            showAlert(`Auto-review enviado con ${provider === 'gemini' ? 'Gemini' : 'Ollama'}`, 'success');
            router.refresh();
        } else {
            showAlert(response.message || 'No se pudo ejecutar el auto-review', 'error');
        }
    };

    const handleAutoUpload = async () => {
        setIsSubmitting(true);
        const provider = getStoredAiProvider();
        const response = await autoUploadWorksheet(workSheetType, workSheetId, provider);
        setIsSubmitting(false);

        if (response.ok) {
            showAlert('Auto-upload enviado', 'success');
            router.refresh();
        } else {
            showAlert(response.message || 'No se pudo ejecutar el auto-upload', 'error');
        }
    };

    const handleReject = async (observation: string) => {
        setIsSubmitting(true);
        const response = await rejectWorksheet(workSheetId, observation);
        setIsSubmitting(false);
        setObservationModal(null);

        if (response.ok) {
            showAlert('Ficha rechazada', 'success');
            router.refresh();
        } else {
            showAlert(response.message || 'No se pudo rechazar la ficha', 'error');
        }
    };

    const handleReopen = async (observation: string) => {
        setIsSubmitting(true);
        const response = await reopenWorksheet(workSheetId, observation);
        setIsSubmitting(false);
        setObservationModal(null);

        if (response.ok) {
            showAlert('Ficha reabierta', 'success');
            router.refresh();
        } else {
            showAlert(response.message || 'No se pudo reabrir la ficha', 'error');
        }
    };

    const renderAiButtons = (className?: string) => (
        <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
            {isPendingEdit && isAiSupported && (
                <button
                    type="button"
                    onClick={handleAutoReview}
                    disabled={isSubmitting}
                    className="rounded-full bg-d-blue px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                    🤖 Auto-review
                </button>
            )}
            {isPendingReview && isAiSupported && (
                <button
                    type="button"
                    onClick={handleAutoUpload}
                    disabled={isSubmitting}
                    className="rounded-full bg-d-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                    📤 Auto-upload
                </button>
            )}
            {isPendingReview && (
                <button
                    type="button"
                    onClick={() => setObservationModal('reject')}
                    disabled={isSubmitting}
                    className="rounded-full bg-d-red px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                    ❌ Rechazar
                </button>
            )}
            {isRejected && (
                <button
                    type="button"
                    onClick={() => setObservationModal('reopen')}
                    disabled={isSubmitting}
                    className="rounded-full bg-d-yellow px-3 py-1.5 text-xs font-semibold text-gray-900 disabled:opacity-60"
                >
                    ♻️ Reabrir
                </button>
            )}
            {!isAiSupported && (isPendingEdit || isPendingReview) && (
                <span
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500"
                    title="IA no disponible para este tipo"
                >
                    IA no disponible para este tipo
                </span>
            )}
        </div>
    );

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
                <div className="mb-3 lg:hidden">
                    {renderAiButtons()}
                </div>
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
                <div className="hidden lg:contents">

                    <ButtonWithPointLeft title={buttonTitle} textColor={buttonTextColor} backgroundColor={buttonBackground} pointColor={buttonPointStyle} />
                    {renderAiButtons('lg:ml-4')}
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

            {observationModal === 'reject' && (
                <ObservationModal
                    title="Rechazar ficha"
                    description="Agrega una observación para rechazar la ficha."
                    confirmLabel="Rechazar"
                    onClose={() => setObservationModal(null)}
                    onConfirm={handleReject}
                />
            )}
            {observationModal === 'reopen' && (
                <ObservationModal
                    title="Reabrir ficha"
                    description="Agrega una observación para reabrir la ficha."
                    confirmLabel="Reabrir"
                    onClose={() => setObservationModal(null)}
                    onConfirm={handleReopen}
                />
            )}
        </div>
    )
}
