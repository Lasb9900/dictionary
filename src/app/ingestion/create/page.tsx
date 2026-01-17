"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorksheet } from "@/src/services/ingestion";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { Toast } from "@/src/components/ingestion/Toast";

const CreateWorksheetPage = () => {
  const router = useRouter();
  const { auth, checking } = useRequireAuth();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("AuthorCard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!auth) {
      return;
    }

    setError(null);
    setMissingFields([]);
    setLoading(true);

    const response = await createWorksheet({
      type,
      title,
      createdBy: auth.userId,
    });

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      setLoading(false);
      return;
    }

    const cardId =
      response.data._id ||
      response.data.id ||
      (response.data as any).cardId ||
      (response.data as any).card?._id;

    if (!cardId) {
      setError("No se recibió el identificador de la ficha.");
      setLoading(false);
      return;
    }

    setToastMessage("Ficha creada correctamente.");
    setTimeout(() => setToastMessage(null), 2500);
    router.push(`/ingestion/editor/${type}/${cardId}`);
  };

  if (checking) {
    return <p className="p-6 text-sm text-gray-500">Cargando...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      {toastMessage && <Toast message={toastMessage} />}
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">
          Crear Ficha
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Genera una nueva worksheet conectada al backend local.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <label className="text-sm text-gray-600">
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Autor, tema o publicación"
          />
        </label>

        <label className="mt-4 block text-sm text-gray-600">
          Tipo de ficha
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="AuthorCard">AuthorCard</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          className="mt-6 rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear ficha"}
        </button>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>
            {missingFields.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CreateWorksheetPage;
