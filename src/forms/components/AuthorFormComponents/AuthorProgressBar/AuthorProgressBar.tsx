'use client'


import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useAlert } from '@/src/users/context/AlertContext';
import { AuthorFormValues } from "../interfaces/AuthorForm";
import { useFormikContext } from "formik";
import { saveAuthorForm } from "@/src/app/dashboard/forms/authorForm/actions/save-author-form";
import { useEffect, useState, useTransition } from "react";
import { autoReviewSheet } from "@/src/app/dashboard/worksheets/actions/auto-review";
import { autoUploadSheet } from "@/src/app/dashboard/worksheets/actions/auto-upload";
import { rejectSheet } from "@/src/app/dashboard/worksheets/actions/reject";
import { markPendingEditSheet } from "@/src/app/dashboard/worksheets/actions/mark-pending-edit";
import { getAuthorForm } from "@/src/app/dashboard/forms/authorForm/actions/get-author-form";

const steps =
    [
        { id: '01', title: 'Autor', name: 'Detalles del Autor', href: '/dashboard/forms/authorForm/authorDetails' },
        { id: '02', title: 'Obras', name: 'Obras', href: '/dashboard/forms/authorForm/works' },
        { id: '03', title: 'Críticas', name: 'Críticas', href: '/dashboard/forms/authorForm/criticisms' },
        { id: '04', title: 'Confirmar datos', name: 'Revisión', href: '/dashboard/forms/authorForm/authorFormReview' },
    ];


export const AuthorProgressBar = () => {

    const { values } = useFormikContext<AuthorFormValues>();
    const pathName = usePathname();
    const { id } = useParams();
    const router = useRouter();
    const AuthorDetails = pathName === `/dashboard/forms/authorForm/${id}/authorDetails`;
    const AuthorFormReview = pathName === `/dashboard/forms/authorForm/${id}/authorFormReview`;
    const Criticisms = pathName === `/dashboard/forms/authorForm/${id}/criticisms`;
    const Works = pathName === `/dashboard/forms/authorForm/${id}/works`;
    const { showAlert } = useAlert();
    const [workSheetStatus, setWorkSheetStatus] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const steps =
    [
        { id: '01', title: 'Autor', name: 'Detalles del Autor', href: `/dashboard/forms/authorForm/${id}/authorDetails` },
        { id: '02', title: 'Obras', name: 'Obras', href: `/dashboard/forms/authorForm/${id}/works` },
        { id: '03', title: 'Críticas', name: 'Críticas', href: `/dashboard/forms/authorForm/${id}/criticisms` },
        { id: '04', title: 'Confirmar datos', name: 'Revisión', href: `/dashboard/forms/authorForm/${id}/authorFormReview` },
    ];

    const Status = (id: string) => {

        if ((AuthorDetails && id === '01') || (Works && id === '02') || (Criticisms && id === '03') || (AuthorFormReview && id === '04')) {
            return 'current';
        } else if ((Works && id === '01') || (Criticisms && (id === '01' || id === '02')) || (AuthorFormReview && (id === '01' || id === '02' || id === '03'))) {
            return 'complete';
        }
    }
    const getPageTitle = () => {

        const currentRoute = steps.find(step => step.href === pathName);

        return currentRoute?.title
    };

    useEffect(() => {
        const loadStatus = async () => {
            if (!id) {
                return;
            }
            const response = await getAuthorForm(id);
            const status = response?.responseData?.status;
            if (status) {
                setWorkSheetStatus(status);
            }
        };

        void loadStatus();
    }, [id]);

    const handleSafeForm = async () => {
        showAlert("Informacion guardada", "success");

        const response = await saveAuthorForm(values, id);

        if (response.ok) {
            showAlert("Informacion guardada", "success");
        } else {
            showAlert("Error", "error");
        }
    }

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
        if (!id) {
            return;
        }
        startTransition(() => {
            void (async () => {
                let response:
                    | Awaited<ReturnType<typeof autoReviewSheet>>
                    | Awaited<ReturnType<typeof autoUploadSheet>>
                    | Awaited<ReturnType<typeof rejectSheet>>
                    | Awaited<ReturnType<typeof markPendingEditSheet>>;

                if (action === 'autoReview') {
                    response = await autoReviewSheet('AuthorCard', String(id));
                } else if (action === 'autoUpload') {
                    response = await autoUploadSheet('AuthorCard', String(id));
                } else if (action === 'reject') {
                    const observation = handlePromptObservation('Ingresa la observación del rechazo');
                    if (!observation) {
                        return;
                    }
                    response = await rejectSheet(String(id), observation);
                } else {
                    const observation = handlePromptObservation('Ingresa la observación para reabrir la ficha');
                    if (!observation) {
                        return;
                    }
                    response = await markPendingEditSheet(String(id), observation);
                }

                handleMissingFields((response as { data?: { missingFields?: string[] } })?.data?.missingFields);

                if (!response.ok) {
                    handleActionError(response.message);
                    return;
                }

                router.refresh();
                setWorkSheetStatus((response as { data?: { status?: string } })?.data?.status || workSheetStatus);
            })();
        });
    };

    return (
        <div className='felx -flex-col'>
            <div className="flex justify-between mt-6">
                <span className="text-4xl text-d-blue font-bold ">{getPageTitle()}</span>
                <div className="flex items-center gap-2">
                    {workSheetStatus === 'Pending Edit' && (
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleIaAction('autoReview')}
                            className={`rounded-full px-4 py-2 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                        >
                            🤖 Generar IA
                        </button>
                    )}
                    {workSheetStatus === 'Pending Review' && (
                        <>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIaAction('autoUpload')}
                                className={`rounded-full px-4 py-2 text-sm font-medium text-white bg-d-blue ${isPending ? 'opacity-50' : ''}`}
                            >
                                📤 Publicar
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIaAction('reject')}
                                className={`rounded-full px-4 py-2 text-sm font-medium text-white bg-d-red ${isPending ? 'opacity-50' : ''}`}
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
                            className={`rounded-full px-4 py-2 text-sm font-medium text-white bg-d-gray-text ${isPending ? 'opacity-50' : ''}`}
                        >
                            ♻️ Reabrir
                        </button>
                    )}
                    {pathName != `/dashboard/forms/authorForm/${id}/authorFormReview` &&
                        <button
                            type="button"
                            onClick={() => handleSafeForm()}
                            className="flex justify-center items-center bg-d-blue h-[45px] w-full max-w-16 sm:max-w-32 text-white px-4 py-2 rounded-full col-span-1 md:row-span-1"
                        >
                            <span className="max-sm:hidden text-sm font-medium">Guardar</span>
                            <CloudArrowUpIcon aria-hidden="true" className="h-6 w-6 text-white sm:ml-4" />
                        </button>
                    }
                </div>
            </div>
            <nav aria-label="Progress">
                <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0 my-7">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className="relative md:flex md:flex-1">
                            {Status(step.id) === 'complete' ? (
                                <Link href={step.href} className="group flex w-full items-center">
                                    <span className="flex items-center px-6 py-3 text-sm font-medium">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-d-green group-hover:bg-d-green-dark">
                                            <span className="text-white group-hover:text-gray-50">{step.id}</span>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-gray-600">{step.name}</span>
                                    </span>
                                </Link>
                            ) : Status(step.id) === 'current' ? (
                                <Link href={step.href} aria-current="step" className="flex items-center px-6 py-3 text-sm font-medium">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-d-green">
                                        <span className="text-d-green">{step.id}</span>
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-d-green-dark">{step.name}</span>
                                </Link>
                            ) : (
                                <Link href={step.href} className="group flex items-center">
                                    <span className="flex items-center px-6 py-3 text-sm font-medium">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                            <span className="text-gray-500 group-hover:text-gray-900">{step.id}</span>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</span>
                                    </span>
                                </Link>
                            )}
                            {stepIdx !== steps.length - 1 ? (
                                <>
                                    {/* Arrow separator for lg screens and up */}
                                    <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-5 md:block">
                                        <svg
                                            fill="none"
                                            viewBox="0 0 22 80"
                                            preserveAspectRatio="none"
                                            className="h-full w-full text-gray-300"
                                        >
                                            <path
                                                d="M0 -2L20 40L0 82"
                                                stroke="currentcolor"
                                                vectorEffect="non-scaling-stroke"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </>
                            ) : null}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    )
}
