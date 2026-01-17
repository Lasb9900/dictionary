"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/src/components/ingestion/StatusBadge";
import { Toast } from "@/src/components/ingestion/Toast";
import { ObservationModal } from "@/src/components/ingestion/ObservationModal";
import { normalizeStatus } from "@/src/lib/status";
import { getStoredAuth } from "@/src/lib/authStorage";
import {
  autoReview,
  autoUpload,
  saveWorksheet,
  type WorksheetPayload,
} from "@/src/services/ingestion.service";
import { getCardById, markPendingEdit, rejectCard } from "@/src/services/cards.service";

const parseList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const CardDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [type, setType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [observation, setObservation] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [text, setText] = useState("");
  const [worksInput, setWorksInput] = useState("");
  const [criticismInput, setCriticismInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoReviewLoading, setAutoReviewLoading] = useState(false);
  const [autoUploadLoading, setAutoUploadLoading] = useState(false);
  const [modalState, setModalState] = useState<"reject" | "reopen" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const canAutoReview = normalizedStatus === "pending-edit";
  const canAutoUpload = normalizedStatus === "pending-review";
  const canReject = normalizedStatus === "pending-review";
  const canReopen = normalizedStatus === "rejected";

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadCard = async () => {
    if (!id) return;
    if (!getStoredAuth()) {
      router.replace("/cards/login");
      return;
    }

    setLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await getCardById(id);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      setLoading(false);
      return;
    }

    const card = response.data;
    setType(card.type ?? null);
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
    loadCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!id || !type) return;
    setSaving(true);
    setError(null);
    setMissingFields([]);

    const response = await saveWorksheet(type, id, payload, {
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
    showToast("Guardado");
  };

  const handleAutoReview = async () => {
    if (!id || !type) return;
    setAutoReviewLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await autoReview(type, id);

    setAutoReviewLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setStatus(response.data.status ?? "Pending Review");
    setObservation(response.data.observation ?? observation);
    showToast("Auto-review generado.");
  };

  const handleAutoUpload = async () => {
    if (!id || !type) return;
    setAutoUploadLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await autoUpload(type, id);

    setAutoUploadLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    setStatus(response.data.status ?? status);
    setObservation(response.data.observation ?? observation);
    showToast("Ficha publicada.");
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
    showToast("Ficha rechazada.");
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
    showToast("Ficha reabierta para edición.");
  };

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Cargando ficha...</p>;
  }

  if (!id || !type) {
    return <p className="p-6 text-sm text-red-600">Ficha no encontrada.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      {toastMessage && <Toast message={toastMessage} />}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/cards")}
            className="text-xs font-semibold text-gray-500"
          >
            ← Volver al dashboard
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

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
            {saving ? "Guardando..." : "💾 Guardar"}
          </button>
          <button
            type="button"
            onClick={handleAutoReview}
            disabled={!canAutoReview || autoReviewLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {autoReviewLoading ? "Generando..." : "🤖 Auto-review"}
          </button>
          <button
            type="button"
            onClick={handleAutoUpload}
            disabled={!canAutoUpload || autoUploadLoading}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {autoUploadLoading ? "Publicando..." : "📤 Auto-upload"}
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
              ♻️ Reabrir
            </button>
          )}
        </div>
      </section>

      <ObservationModal
        open={modalState === "reject"}
        title="Rechazar ficha"
        description="Deja una observación para el editor."
        placeholder="Rechazo de prueba: datos incompletos"
        confirmLabel="Rechazar"
        onClose={() => setModalState(null)}
        onConfirm={handleReject}
      />

      <ObservationModal
        open={modalState === "reopen"}
        title="Reabrir ficha"
        description="Indica qué debe corregirse antes de volver a revisar."
        placeholder="Reabierta para correcciones"
        confirmLabel="Reabrir"
        onClose={() => setModalState(null)}
        onConfirm={handleReopen}
      />
    </div>
  );
};

export default CardDetailPage;
