'use client'
import { PlusIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from "react"
import { AuthorFormValues, WorkFormValues } from "../../AuthorFormComponents/interfaces/AuthorForm"
import { SimpleInputWithoutFormik } from "../../SimpleInputWithoutFormik/SimpleInputWithoutFormik"
import { useParams, useRouter } from "next/navigation";
import { useFormikContext } from 'formik'
import { SelectDateWithProps } from "../../SelectDateWithProps/SelectDateWithProps"
import { PlacePublicationWorkForm } from "../PlacePublicationWorkForm/PlacePublicationWorkForm"
import { ExpandableInputWork } from "../EpandableInputWork/ExpandableInputWork"
import { MultimediaInput } from "../../MultimediaInput/MultimediaInput"
import { WorksTable } from '../WorksTable/WorksTable'
import { ButtonWithIconLeft } from '@/src/components/ButtonWithIconLeft/ButtonWithIconLeft'
import Link from 'next/link'
import { MultimediaChargedWorks } from '../MultimediaChargedWorks/MultimediaChargedWorks'
import { WorkEditions } from '../WorkEditions/WorkEditions'
import { DebugFormikValues } from '../../DebugFormikValues/DebugFormikValues'
import { ExpandableDescriptionMultimedia } from '../ExpandableDescriptionMultimedia/ExpandableDescriptionMultimedia'
import { useAlert } from '@/src/users/context/AlertContext'
import { saveAuthorForm } from '@/src/app/dashboard/forms/authorForm/actions/save-author-form'
import { createWorkAutoAuthor } from '@/src/app/dashboard/forms/authorForm/actions/create-work-auto-author'




export const WorksForm = () => {

    const { id } = useParams();

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'worksPreset';

    const { values, setFieldValue } = useFormikContext<AuthorFormValues>();
    const { showAlert } = useAlert();
    const router = useRouter();
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [multimediaField, setMultimediaField] = useState(
        { title: '', link: '', type: '', description: '' }
    );

    const [typeMultimediaField, setTypeMultimediaField] = useState<File | undefined>(undefined)
    const [descriptionMedia, setDescriptionMedia] = useState('');

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [work, setWork] = useState<WorkFormValues>({
        title: '',
        originalLanguage: '',
        genre: '',
        publicationDate: '',
        description: '',
        publicationPlace: { city: '', printingHouse: '', publisher: '' },
        multimedia: [],
        editions: [],
        text: ''
    });
    //const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);


    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setTypeMultimediaField(file)
        setLoading(true);
        const fileType = file.type.startsWith('image') ? 'image' : 'raw';
        const fileTypeForm = file.type.split('/')[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${fileType}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setImageUrl(data.secure_url); // URL segura de la imagen



            setMultimediaField((preMultimediaField) => ({
                ...preMultimediaField,
                title: file.name,
                link: data.secure_url, // URL del archivo subido
                type: fileTypeForm,        // Tipo de archivo (image o raw)
            }));
        } catch (error) {
            console.log('Error al subir la imagen:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMultimediaField = () => {
        if (!multimediaField.title || !multimediaField.link || !multimediaField.type) {
            console.log("Campos multimedia incompletos. No se puede agregar.");
            return;
        }
        setMultimediaField({
            ...multimediaField,
            description: descriptionMedia,
        });

    }


    const handleAddWork = async () => {
        if (!work.title) return;

        if (editingIndex !== null) {
            // Si estamos editando una obra, actualizamos la existente
            const updatedWorks = values.works.map((existingWork, index) =>
                index === editingIndex ? work : existingWork
            );
            setFieldValue('works', updatedWorks);
            setEditingIndex(null); // Resetear el índice de edición
        } else {
            const autoAuthorResponse = await createWorkAutoAuthor({ authorId: id, work });
            if (autoAuthorResponse.ok) {
                if (autoAuthorResponse.data?.authorCreated) {
                    showAlert("Se creó ficha del autor automáticamente", "success");
                }
            } else if (autoAuthorResponse.message !== 'TODO_ENDPOINT') {
                showAlert(autoAuthorResponse.message || "No se pudo crear la obra en el backend", "error");
            }
            // Agregar una nueva obra
            const updatedWorks = [...values.works, work];
            setFieldValue('works', updatedWorks);
        }

        setIsFormVisible(false);

        // Limpiar los campos del formulario
        setWork({
            title: '',
            originalLanguage: '',
            genre: '',
            publicationDate: '',
            description: '',
            publicationPlace: { city: '', printingHouse: '', publisher: '' },
            multimedia: [{ title: '', link: '', type: '', description: '' }],
            editions: [{ editiontitle: '', publicationDate: '', publicationPlace: { city: '', printingHouse: '', publisher: '' }, language: '', translator: '' }],
            text: ''
        });

        setSelectedDay(null);
        setSelectedMonth(null);
        setSelectedYear(null);
    };

    const handleDeleteMultimedia = (index: number) => {
        const updatedMultimedias = work.multimedia.filter((_, i) => i !== index);
        setWork({ ...work, multimedia: updatedMultimedias });
    };

    const handleFormVisible = () => {
        setIsFormVisible(true); // Al presionar el botón, mostrar el formulario
        setWork({
            title: '',
            originalLanguage: '',
            genre: '',
            publicationDate: '',
            description: '',
            publicationPlace: { city: '', printingHouse: '', publisher: '' },
            multimedia: [],
            editions: [],
            text: ''
        });

        setSelectedDay(null);
        setSelectedMonth(null);
        setSelectedYear(null);

    };

    const handleFormNotVisible = () => {
        setIsFormVisible(false); // Al presionar el botón, mostrar el formulario
    };

    useEffect(() => {
        if (multimediaField.link && multimediaField.title && multimediaField.type && multimediaField.description) {
            setWork({ ...work, multimedia: [...work.multimedia, multimediaField] });
            setDescriptionMedia('');
            setMultimediaField({ title: '', link: '', type: '', description: '' })
            setImageUrl('');
            setTypeMultimediaField(undefined);
        }
    }, [multimediaField.description]);

    const handleEditWork = (index: number) => {
        const workToEdit = values.works[index];
        setWork(workToEdit); // Carga la obra seleccionada en el estado del formulario
        setEditingIndex(index);
        setIsFormVisible(true); // Muestra el formulario para editar
    };

    const handleSafeForm = async () => {
        const response = await saveAuthorForm(values, id);
        if (response.ok) {
            showAlert("Informacion guardada", "success");
            router.push(`/dashboard/forms/authorForm/${id}/criticisms`);
        } else {
            showAlert("Error", "error");
        }
    }

    return (
        <div className="h-calc(100vh) overflow-y-auto mb-14 px-1">
            <div>
                {
                    isFormVisible ?
                        (
                            <div className="grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-y-7 md:gap-x-7 xl:gap-x-14 xl:gap-y-8">

                                <SimpleInputWithoutFormik
                                    id="work-title"
                                    value={work.title}
                                    onChange={(e) => setWork({ ...work, title: e.target.value })}
                                    type="text"
                                    label="Título de la Obra"
                                    labelTextStyle="text-gray-900 text-sm"
                                    inputWidth="w-full h-9"
                                    focusBorderColor="focus:ring-[#003366]"
                                    globalStyle="col-span-1 md:col-span-2"
                                />

                                <SimpleInputWithoutFormik
                                    id="work-lenguage"
                                    value={work.originalLanguage}
                                    onChange={(e) => setWork({ ...work, originalLanguage: e.target.value })}
                                    type="text"
                                    label="Idioma original"
                                    labelTextStyle="text-gray-900 text-sm"
                                    inputWidth="w-full h-9"
                                    focusBorderColor="focus:ring-[#003366]"
                                    globalStyle="col-span-1"
                                />

                                <SimpleInputWithoutFormik
                                    id="work-genre"
                                    value={work.genre}
                                    onChange={(e) => setWork({ ...work, genre: e.target.value })}
                                    type="text"
                                    label="Género"
                                    labelTextStyle="text-gray-900 text-sm"
                                    inputWidth="w-full h-9"
                                    focusBorderColor="focus:ring-[#003366]"
                                    globalStyle="col-span-1 md:col-span-2"
                                />


                                <SelectDateWithProps
                                    title="Fecha de publicación"
                                    globalStyle="col-span-1"
                                    setState={setWork} // Pasamos la función setWork como prop
                                    state={work}
                                    setSelectedDay={setSelectedDay}
                                    setSelectedMonth={setSelectedMonth}
                                    setSelectedYear={setSelectedYear}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    selectedDay={selectedDay}
                                />

                                <PlacePublicationWorkForm
                                    idPlace="place"
                                    idPrinting="printing"
                                    idPublisher="publisher"
                                    valuePlace={work.publicationPlace.city}
                                    onChangePlace={(e) => setWork({
                                        ...work,
                                        publicationPlace: { ...work.publicationPlace, city: e.target.value }
                                    })}
                                    valuePrinting={work.publicationPlace.printingHouse}
                                    onChangePrinting={(e) => setWork({
                                        ...work,
                                        publicationPlace: { ...work.publicationPlace, printingHouse: e.target.value }
                                    })}
                                    valuePublisher={work.publicationPlace.publisher}
                                    onChangePublisher={(e) => setWork({
                                        ...work,
                                        publicationPlace: { ...work.publicationPlace, publisher: e.target.value }
                                    })}
                                    type="text"
                                    label="Lugar de Publicación"
                                    labelTextStyle="text-gray-900 text-sm"
                                    inputWidth="w-full"
                                    focusBorderColor="focus:ring-[#003366]"
                                    globalStyle="col-span-1 md:col-span-3"
                                />

                                <div className="col-span-full grid grid-cols-1 gap-y-8 md:gap-x-4 md:grid-cols-3  ">

                                    <WorkEditions
                                        globalStyle={"col-span-1 md:col-span-3"}
                                        work={work}
                                        setWork={setWork}
                                    />

                                </div>

                                <ExpandableInputWork
                                    id="description"
                                    value={work.description}
                                    onChange={(e) => setWork({ ...work, description: e.target.value })}
                                    label={"Descripción o resumen"}
                                    labelTextStyle={"text-gray-900 text-sm"}
                                    globalStyle={"col-span-full"}
                                />


                                <div className="col-span-full grid grid-cols-1 gap-y-8 md:gap-y-5 md:grid-rows-3 md:grid-cols-2 md:gap-x-7 xl:gap-x-14">
                                    <MultimediaInput
                                        title={"Archivos multimedia"}
                                        globalStyle={"col-span-1 md:row-span-3"}
                                        handleMultimediaFileChange={handleImageUpload}
                                        loading={loading}
                                        imageUrl={imageUrl}
                                        typeMultimediaField={typeMultimediaField}
                                    />

                                    <ExpandableDescriptionMultimedia
                                        id="description"
                                        value={descriptionMedia}
                                        onChange={(e) => setDescriptionMedia(e.target.value)}
                                        label={"Descripción"}
                                        labelTextStyle={"text-gray-900 text-sm"}
                                        globalStyle={"col-span-1 md:row-span-2"}
                                        multimediaLink={multimediaField.link}
                                    />



                                    <button
                                        type="button"
                                        onClick={handleAddMultimediaField}
                                        className="flex justify-center items-center bg-d-blue h-[47px] w-full text-white px-4 py-2 rounded-full col-span-1 md:row-span-1"
                                    >
                                        Agregar Archivo
                                        <PlusIcon aria-hidden="true" className="h-7 w-7 text-white ml-4" />
                                    </button>

                                </div>

                                <MultimediaChargedWorks
                                    globalStyle="col-span-full md:col-sapn-3"
                                    multimedias={work.multimedia}
                                    handleDeleteMultimedia={handleDeleteMultimedia}
                                />

                                <div className="flex flex-col max-md:space-y-6 max-md:w-full col-span-1 md:col-span-full md:space-x-8 md:flex-row md:justify-end md:mt-16">

                                    <button
                                        type="button"
                                        onClick={handleFormNotVisible}
                                        className="bg-red-700 text-white text-sm font-medium leading-6 md:w-[162px] py-2 rounded-full"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAddWork}
                                        className="bg-d-blue text-white text-sm font-medium leading-6 md:w-[162px] py-2 rounded-full"
                                    >
                                        Cargar Obra
                                    </button>
                                </div>

                            </div>
                        ) :
                        (

                            <div className='flex flex-col mt-8'>
                                <div
                                    className='w-full flex justify-end items-end'
                                    onClick={handleFormVisible}
                                >
                                    <ButtonWithIconLeft
                                        title="Agregar Obra"
                                        textColor="text-white"
                                        backgroundColor="bg-d-green"
                                        hover="hover:bg-d-green-light"
                                        icon=<PlusIcon />
                                        iconColor="text-white"
                                    />
                                </div>
                                <WorksTable
                                    works={values.works}
                                    handleEditWork={handleEditWork}
                                />
                                <div className='flex max-md:flex-col max-md:space-y-6 md:flex-row md:justify-between'>
                                    <Link href={`/dashboard/forms/authorForm/${id}/authorDetails`}>
                                        <button className={`flex max-md:justify-center rounded-full px-5 py-3 text-white bg-d-blue`}>
                                            <ArrowLeftIcon className="w-6 h-6 text-white mr-4" />
                                            <span className="text-[15px] font-medium">Anterior</span>
                                        </button>
                                    </Link>
                                    <button
                                        className={`flex max-md:justify-center rounded-full px-5 py-3 text-white bg-d-blue`}
                                        onClick={() => handleSafeForm()}
                                    >
                                        <span className="text-[15px] font-medium mr-4">Siguiente</span>
                                        <ArrowRightIcon className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>
                        )
                }
            </div>
        </div>
    )
}
