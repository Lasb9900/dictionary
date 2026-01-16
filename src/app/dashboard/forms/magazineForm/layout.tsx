'use client'

import { MagazineFormValues } from "@/src/forms/components/MagazineFormComponents/interfaces/MagazineForm";
import { AlertProvider } from "@/src/users/context/AlertContext";
import { Form, Formik, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import * as Yup from 'yup';
import { useParams, usePathname } from "next/navigation";
import { getMagazineForm } from "./actions/get-magazine-form";

export default function MagazineFormLayout({ children }: { children: React.ReactNode; }) {

    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [magazineInitialValue, setMagazineInitialValue] = useState<MagazineFormValues>();

    const SaveFormValues = () => {
        const { values } = useFormikContext<MagazineFormValues>();

        useEffect(() => {
            localStorage.setItem(`magazineFormData-${id}`, JSON.stringify(values));
        }, [values]);

        return null; // Este componente solo se utiliza para ejecutar el useEffect
    };

    useEffect(() => {
        const fetchMagazineData = async () => {
            setIsLoading(true);
            try {
                const response = await getMagazineForm(id);
                const { _id, ...initialValues } = response?.responseData;
                setMagazineInitialValue(initialValues);
                console.log(initialValues)
            } catch (error) {
                console.error('Error fetching author data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMagazineData();
    }, [id]);

    const initialValues = JSON.parse(JSON.stringify({
        magazineTitle: '',
        originalLanguage: '',
        sections: '',
        firstIssueDate: '',
        lastIssueDate: '',
        issuesPublished: '',
        publicationPlace: {
            city: '',
            printingHouse: '',
            publisher: '',
        },
        link: '',
        bibliographicReference: '',
        description: '',
        multimedia: [],
        creators: [],
        criticism: [],
        text: ''
    }));

    const validationSchema = Yup.object({
        magazineTitle: Yup.string()
            .max(100, 'El título de la revista no puede superar los 100 caracteres')
            .nullable(),
        originalLanguage: Yup.string()
            .max(50, 'El idioma original no puede superar los 50 caracteres')
            .nullable(),
        firstIssueDate: Yup.string()
            .nullable(),
        lastIssueDate: Yup.string()
            .nullable(),
        issuesPublished: Yup.string()
            .nullable(),
        sections: Yup.string()
            .nullable(),
        publicationPlace: Yup.object({
            city: Yup.string()
                .max(100, 'La ciudad no puede superar los 100 caracteres')
                .nullable(),
            printingHouse: Yup.string()
                .max(100, 'La impresión no puede superar los 100 caracteres')
                .nullable(),
            publisher: Yup.string()
                .max(100, 'El nombre del editor no puede superar los 100 caracteres')
                .nullable()
        }),
        description: Yup.string()
            .nullable(),
        multimedia: Yup.array().of(
            Yup.object({
                title: Yup.string()
                    .max(100, 'El título no puede superar los 100 caracteres')
                    .nullable(),
                link: Yup.string()
                    .url('Debe ser una URL válida')
                    .nullable(),
                type: Yup.string()
                    .oneOf(['image', 'video', 'audio', 'document'], 'Tipo de multimedia inválido')
                    .nullable(),
                description: Yup.string()
                    .max(300, 'La descripción no puede superar los 300 caracteres')
                    .nullable(),
            })
        ).nullable(),
        creators: Yup.array().of(
            Yup.object({
                name: Yup.string()
                    .max(100, 'El nombre no puede superar los 100 caracteres')
                    .nullable(),
                role: Yup.string()
                    .max(100, 'El rol no puede superar los 100 caracteres')
                    .nullable(),
            })
        ).nullable(),
        criticism: Yup.array().of(
            Yup.object({
                title: Yup.string()
                    .max(100, 'El título no puede superar los 100 caracteres')
                    .nullable(),
                type: Yup.string()
                    .max(50, 'El tipo no puede superar los 50 caracteres')
                    .nullable(),
                author: Yup.string()
                    .max(100, 'El nombre del autor no puede superar los 100 caracteres')
                    .nullable(),
                publicationDate: Yup.string()
                    .nullable(),
                link: Yup.string()
                    .url('Debe ser una URL válida')
                    .nullable(),
                bibliographicReference: Yup.string()
                    .max(500, 'La referencia bibliográfica no puede superar los 500 caracteres')
                    .nullable(),
                description: Yup.string()
                    .max(500, 'La descripción no puede superar los 500 caracteres')
                    .nullable(),
                multimedia: Yup.array().of(
                    Yup.object({
                        title: Yup.string()
                            .max(100, 'El título no puede superar los 100 caracteres')
                            .nullable(),
                        link: Yup.string()
                            .url('Debe ser una URL válida')
                            .nullable(),
                        type: Yup.string()
                            .oneOf(['image', 'video', 'audio', 'document'], 'Tipo de multimedia inválido')
                            .nullable(),
                        description: Yup.string()
                            .max(300, 'La descripción no puede superar los 300 caracteres')
                            .nullable(),
                    })
                ).nullable(),
            })
        ).nullable(),
    });

    const handleSubmitMagazineForm = (values: any) => {
        console.log('Formulario enviado:', values);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-d-fondo">
                <div className="flex flex-col items-center space-y-2">
                    {/* Spinner */}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-d-blue"></div>

                    {/* Texto de carga */}
                    <p className="text-lg font-semibold text-gray-700 tracking-wide">
                        Cargando...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Formik<MagazineFormValues>
            initialValues={magazineInitialValue || initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleSubmitMagazineForm(values)}
        >
            {formik => {

                return (
                    <Form>
                        <SaveFormValues />
                        <div className=''>
                            <div className='flex flex-col mx-5 lg:mx-9 xl:mx-20'>
                                <AlertProvider>
                                    {children}
                                </AlertProvider>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}
