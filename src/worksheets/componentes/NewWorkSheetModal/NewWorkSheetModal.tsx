"use client";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { SimpleInputWithLabel } from "@/src/forms/components/SimpleInputWithLabel/SimpleInputWithLabel";
import { CheckTypeWorkSheet } from "../CheckTypeWorkSheet/CheckTypeWorkSheet";
import { SelectPersonInput } from "../SelectPersonInput/SelectPersonInput";
import { SimpleButton } from "@/src/components/SimpleButton/SimpleButton";
import { useState } from "react";
import { Alert } from "@/src/forms/components/Alert/Alert";
import { addNewWorksheet } from "@/src/worksheets/actions/add-new-worksheet";
import { updateWorksheet } from "@/src/worksheets/actions/update-worksheet";
import { useSession } from "next-auth/react";

export interface NewWorkSheetModalProps {
  onClose: () => void;
  onSave?: (roles: string[]) => Promise<boolean>;
  initialData?: {
    id?: string;
    title: string;
    workSheetType: string;
    editors: string[];
    reviewers: string[];
  };
}

export const NewWorkSheetModal = ({ onClose, initialData }: NewWorkSheetModalProps) => {
  const [editorSelection, setEditorSelection] = useState<string | null>(null);
  const [reviewerSelection, setReviewerSelection] = useState<string | null>(null);
  const [workSheetType, setWorkSheetType] = useState<string>(initialData?.workSheetType || "AuthorCard");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setSubmitError(null);

    const createPayload = {
      type: values.workSheetType,
      title: values.title,
      createdBy: session?.user._id ?? "",
      assignedEditors: values.editors,
      assignedReviewers: values.reviewers,
    };

    const updatePayload = {
        id: initialData?.id,
        title: values.title,
        type: values.workSheetType,
        assignedEditors: values.editors,
        assignedReviewers: values.reviewers,
    };

    console.log(createPayload)

    const response = await (initialData ? updateWorksheet(updatePayload) : addNewWorksheet(createPayload));

    setLoading(false);

    if (response.ok) {
      onClose();
    } else {
      setSubmitError(response.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 max-lg:px-6">
      <div className="bg-d-fondo p-6 rounded-md max-w-[470px] w-full">
        <div className="flex flex-row justify-between mb-9">
          <h2 className="text-xl font-medium self-center text-d-gray">
            {initialData ? "Editar Ficha" : "Nueva Ficha"}
          </h2>
          <svg
            onClick={onClose}
            className="self-center cursor-pointer"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 13L13 1M1 1L13 13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <Formik
            initialValues={{
              title: initialData?.title || "",
              workSheetType: initialData?.workSheetType || "AuthorCard",
              editors: initialData?.editors || [],
              reviewers: initialData?.reviewers || [],
            }}
            onSubmit={handleSubmit}
            validationSchema={Yup.object({
              title: Yup.string().max(50, "El título no puede ser tan extenso").required("El título es requerido"),
              workSheetType: Yup.string().required("El tipo de ficha es requerido"),
              editors: Yup.array().min(1, "Debe haber al menos un editor seleccionado"),
              reviewers: Yup.array().min(1, "Debe haber al menos un revisor seleccionado"),
            })}
          >
            {(formik) => (
              <Form>
                <SimpleInputWithLabel
                  id="title"
                  name="title"
                  type="text"
                  label="Título"
                  labelTextStyle="text-gray-900 text-sm"
                  inputWidth="w-full"
                  focusBorderColor="focus:ring-[#003366]"
                />
                <CheckTypeWorkSheet name="workSheetType" onTypeChange={setWorkSheetType} isEditing={!!initialData} />

                <SelectPersonInput
                  title="Editores"
                  type="editor"
                  excludeIds={formik.values.reviewers}
                  selectedPeople={formik.values.editors} // Pasa los editores preseleccionados
                  onAdd={(id) => formik.setFieldValue("editors", [...formik.values.editors, id])}
                  onRemove={(id) =>
                    formik.setFieldValue(
                      "editors",
                      formik.values.editors.filter((editorId) => editorId !== id)
                    )
                  }
                  currentSelection={editorSelection}
                  onSelectionChange={setEditorSelection}
                />
                <ErrorMessage name="editors" render={(msg) => <Alert text={msg} type="error" />} />

                <SelectPersonInput
                  title="Revisores"
                  type="reviewer"
                  excludeIds={formik.values.editors}
                  selectedPeople={formik.values.reviewers} // Pasa los revisores preseleccionados
                  onAdd={(id) => formik.setFieldValue("reviewers", [...formik.values.reviewers, id])}
                  onRemove={(id) =>
                    formik.setFieldValue(
                      "reviewers",
                      formik.values.reviewers.filter((reviewerId) => reviewerId !== id)
                    )
                  }
                  currentSelection={reviewerSelection}
                  onSelectionChange={setReviewerSelection}
                />
                <ErrorMessage name="reviewers" render={(msg) => <Alert text={msg} type="error" />} />

                {submitError && <Alert text={submitError} type="error" />}
                <div className="flex justify-end mt-10">
                  <SimpleButton
                    title={loading ? "Actualizando..." : initialData ? "Actualizar Ficha" : "Crear Ficha"}
                    type="submit"
                    textColor="text-white"
                    backgroundColor="bg-d-blue"
                    hover="hover:bg-[#00284D]"
                    disabled={loading}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
