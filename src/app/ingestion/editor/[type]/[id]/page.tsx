"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import {
  autoOrchestrate,
  autoReview,
  autoUpload,
  saveWorksheet,
  WorksheetPayload,
} from "@/src/services/ingestion";
import { getCardById, markPendingEdit, rejectCard } from "@/src/services/cards";
import { StatusBadge } from "@/src/components/ingestion/StatusBadge";
import { ObservationModal } from "@/src/components/ingestion/ObservationModal";
import { AiActions } from "@/src/components/ingestion/AiActions";
import { Toast } from "@/src/components/ingestion/Toast";
import { normalizeStatus } from "@/src/lib/status";

const parseList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const EditorPage = () => {
  const router = useRouter();
  const params = useParams();
  const { checking } = useRequireAuth();

  const type = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [fullName, setFullName] = useState("");
  const [text, setText] = useState("");
  const [worksInput, setWorksInput] = useState("");
  const [criticismInput, setCriticismInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [observation, setObservation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoReviewLoading, setAutoReviewLoading] = useState(false);
  const [autoUploadLoading, setAutoUploadLoading] = useState(false);
  const [autoOrchestrateLoading, setAutoOrchestrateLoading] = useState(false);
  const [modalState, setModalState] = useState<"reject" | "reopen" | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [outputIA, setOutputIA] = useState<string>("");
  const [autoReviewEnabled, setAutoReviewEnabled] = useState(true);
  const [autoUploadEnabled, setAutoUploadEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState("");

  const payload = useMemo<WorksheetPayload>(
    () => ({
      fullName,
      text,
      works: parseList(worksInput),
      criticism: parseList(criticismInput),
    }),
    [fullName, text, worksInput, criticismInput]
  );

  const normalizedStatus = normalizeStatus(status);
  const canAutoReview = fullName.trim().length > 0;
  const canAutoUpload = normalizedStatus === "pending-review";
  const canReject = normalizedStatus === "pending-review";
  const canReopen = normalizedStatus === "rejected";

  const loadCard = async () => {
    if (!id) {
      setError("No se encontró el ID de la ficha.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await getCardById(id);

    if (!response.ok) {
      setError(response.error.message);
      setLoading(false);
      return;
    }

    const card = response.data;
    setStatus(card.status ?? null);
    setObservation(card.observation ?? null);

    const incomingPayload = card.payload ?? {};
    setFullName((incomingPayload.fullName as string) ?? "");
    setText((incomingPayload.text as string) ?? "");
    setWorksInput(
      Array.isArray(incomingPayload.works)
        ? incomingPayload.works.join("\n")
        : ""
    );
    setCriticismInput(
      Array.isArray(incomingPayload.criticism)
        ? incomingPayload.criticism.join("\n")
        : ""
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!checking) {
      loadCard();
    }
  }, [checking]);

  const handleSave = async () => {
    if (!type || !id) return;
    setSaving(true);
    setError(null);
    setMissingFields([]);

    const response = await saveWorksheet(type as string, id, payload, {
      autoReview: false,
      autoUpload: false,
    });

    setSaving(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setStatus(response.data.status ?? status);
    setObservation(response.data.observation ?? observation);
    setToastMessage("Guardado");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleAutoReview = async () => {
    if (!type || !id) return;
    setAutoReviewLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await autoReview(type as string, id, aiProvider || undefined);

    setAutoReviewLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setOutputIA(JSON.stringify(response.data, null, 2));
    setStatus(response.data.status ?? "Pending Review");
    setObservation(response.data.observation ?? observation);
    if (response.data.payload) {
      const updated = response.data.payload as any;
      setFullName(updated.fullName ?? fullName);
      setText(updated.text ?? text);
      setWorksInput(
        Array.isArray(updated.works) ? updated.works.join("\n") : worksInput
      );
      setCriticismInput(
        Array.isArray(updated.criticism)
          ? updated.criticism.join("\n")
          : criticismInput
      );
    }
  };

  const handleAutoUpload = async () => {
    if (!type || !id) return;
    setAutoUploadLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await autoUpload(type as string, id, aiProvider || undefined);

    setAutoUploadLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setOutputIA(JSON.stringify(response.data, null, 2));
    setStatus(response.data.status ?? status);
    setObservation(response.data.observation ?? observation);
  };

  const handleAutoOrchestrate = async () => {
    if (!type || !id) return;
    setAutoOrchestrateLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await autoOrchestrate(
      type as string,
      id,
      payload,
      {
        autoReview: autoReviewEnabled,
        autoUpload: autoUploadEnabled,
      },
      aiProvider || undefined
    );

    setAutoOrchestrateLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setOutputIA(JSON.stringify(response.data, null, 2));
    setStatus(response.data.status ?? status);
    setObservation(response.data.observation ?? observation);
    if (response.data.payload) {
      const updated = response.data.payload as any;
      setFullName(updated.fullName ?? fullName);
      setText(updated.text ?? text);
      setWorksInput(
        Array.isArray(updated.works) ? updated.works.join("\n") : worksInput
      );
      setCriticismInput(
        Array.isArray(updated.criticism)
          ? updated.criticism.join("\n")
          : criticismInput
      );
    }
  };

  const handleReject = async (observationText: string) => {
    if (!id) return;
    const response = await rejectCard(id, observationText);
    if (!response.ok) {
      setError(response.error.message);
      return;
    }

    setStatus(response.data.status ?? "Rejected");
    setObservation(response.data.observation ?? observationText);
    setModalState(null);
  };

  const handleReopen = async (observationText: string) => {
    if (!id) return;
    const response = await markPendingEdit(id, observationText);
    if (!response.ok) {
      setError(response.error.message);
      return;
    }

    setStatus(response.data.status ?? "Pending Edit");
    setObservation(response.data.observation ?? observationText);
    setModalState(null);
  };

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Cargando ficha...</p>;
  }

  if (!type || !id) {
    return (
      <div className="p-6 text-sm text-red-600">Ficha no encontrada.</div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      {toastMessage && <Toast message={toastMessage} />}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/ingestion/boards")}
            className="text-xs font-semibold text-gray-500"
          >
            ← Volver a bandejas
          </button>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Editor de ficha
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tipo: {type} · ID: {id}
          </p>
        </div>
        <StatusBadge status={status ?? "Pending Edit"} />
      </header>

      {observation && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Última observación: {observation}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <label className="text-sm text-gray-600">
              Nombre completo
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Jorge Luis Borges"
              />
            </label>
            <label className="text-sm text-gray-600">
              Texto
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="mt-2 min-h-[160px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-600">
              Obras (una por línea)
              <textarea
                value={worksInput}
                onChange={(event) => setWorksInput(event.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-600">
              Crítica (una por línea)
              <textarea
                value={criticismInput}
                onChange={(event) => setCriticismInput(event.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Guardando..." : "✅ Guardar"}
            </button>
            {canReject && (
              <button
                type="button"
                onClick={() => setModalState("reject")}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                ❌ Rechazar
              </button>
            )}
            {canReopen && (
              <button
                type="button"
                onClick={() => setModalState("reopen")}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white"
              >
                ♻️ Reabrir para edición
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">AI Provider</h2>
            <p className="mt-1 text-xs text-gray-500">
              Opcional: selecciona un provider para enviar en x-ai-provider.
            </p>
            <input
              value={aiProvider}
              onChange={(event) => setAiProvider(event.target.value)}
              placeholder="openai | anthropic | ..."
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <AiActions
            canAutoReview={canAutoReview}
            canAutoUpload={canAutoUpload}
            autoReviewEnabled={autoReviewEnabled}
            autoUploadEnabled={autoUploadEnabled}
            onToggleAutoReview={setAutoReviewEnabled}
            onToggleAutoUpload={setAutoUploadEnabled}
            onAutoReview={handleAutoReview}
            onAutoUpload={handleAutoUpload}
            onAutoOrchestrate={handleAutoOrchestrate}
            loading={{
              autoReview: autoReviewLoading,
              autoUpload: autoUploadLoading,
              autoOrchestrate: autoOrchestrateLoading,
            }}
          />

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Output IA</h2>
            <p className="mt-1 text-xs text-gray-500">
              Se mostrará la respuesta cruda del backend IA.
            </p>
            <pre className="mt-3 max-h-[240px] overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
              {outputIA || "Sin ejecuciones aún."}
            </pre>
          </div>
        </div>
      </section>

      <ObservationModal
        open={modalState === "reject"}
        title="Rechazar ficha"
        description="La ficha se moverá a Rejected y guardará la observación."
        placeholder="Rechazo de prueba: datos incompletos"
        confirmLabel="Rechazar"
        onClose={() => setModalState(null)}
        onConfirm={handleReject}
      />

      <ObservationModal
        open={modalState === "reopen"}
        title="Reabrir ficha"
        description="La ficha volverá a Pending Edit."
        placeholder="Reabierta para correcciones"
        confirmLabel="Reabrir"
        onClose={() => setModalState(null)}
        onConfirm={handleReopen}
      />
    </div>
  );
};

export default EditorPage;
