"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth } from "@/src/lib/authStorage";
import { normalizeStatus } from "@/src/lib/status";
import { Toast } from "@/src/components/ingestion/Toast";
import { ObservationModal } from "@/src/components/ingestion/ObservationModal";
import { StatusBadge } from "@/src/components/ingestion/StatusBadge";
import {
  createWorksheet,
  autoReview,
  autoUpload,
  type Worksheet,
} from "@/src/services/ingestion.service";
import {
  getPendingEditCards,
  getPendingReviewCards,
  getRejectedCards,
  markPendingEdit,
  rejectCard,
} from "@/src/services/cards.service";

const STATUS_TABS = [
  { key: "pending-edit", label: "Pending Edit" },
  { key: "pending-review", label: "Pending Review" },
  { key: "rejected", label: "Rejected" },
];

const normalizeList = (data: Worksheet[] | { data?: Worksheet[] } | null) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.data ?? [];
};

type CardActionState = {
  autoReview?: boolean;
  autoUpload?: boolean;
  reject?: boolean;
  reopen?: boolean;
};

const getCardId = (card: Worksheet | null) => card?._id ?? card?.id ?? "";

export default function CardsPage() {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [cardsByStatus, setCardsByStatus] = useState<Record<string, Worksheet[]>>(
    {}
  );
  const [activeTab, setActiveTab] = useState(STATUS_TABS[0].key);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [actionState, setActionState] = useState<
    Record<string, CardActionState>
  >({});
  const [modalState, setModalState] = useState<{
    type: "reject" | "reopen" | null;
    card: Worksheet | null;
  }>({ type: null, card: null });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const ensureAuth = () => {
    if (!auth) {
      router.replace("/cards/login");
      return false;
    }
    return true;
  };

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    setMissingFields([]);

    const [pendingEdit, pendingReview, rejected] = await Promise.all([
      getPendingEditCards(),
      getPendingReviewCards(),
      getRejectedCards(),
    ]);

    const failures = [pendingEdit, pendingReview, rejected].filter(
      (response) => !response.ok
    );

    if (failures.length > 0) {
      const firstFailure = failures[0] as any;
      setError(firstFailure.error?.message ?? "No se pudieron cargar las fichas");
      setMissingFields(firstFailure.error?.missingFields ?? []);
      setLoading(false);
      return;
    }

    setCardsByStatus({
      "pending-edit": normalizeList((pendingEdit as any).data),
      "pending-review": normalizeList((pendingReview as any).data),
      rejected: normalizeList((rejected as any).data),
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!ensureAuth()) return;
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWorksheet = async () => {
    if (!ensureAuth()) return;
    if (!createTitle.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setCreateLoading(true);
    setError(null);
    setMissingFields([]);

    const response = await createWorksheet({
      type: "AuthorCard",
      title: createTitle,
      createdBy: auth?.userId ?? "",
    });

    setCreateLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    const cardId = response.data._id || response.data.id || (response.data as any).cardId;
    if (cardId) {
      showToast("Ficha creada correctamente.");
      setCreateTitle("");
      router.push(`/cards/${cardId}`);
      return;
    }

    setError("No se recibió el ID de la ficha.");
  };

  const updateActionState = (cardId: string, patch: CardActionState) => {
    setActionState((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], ...patch },
    }));
  };

  const handleAutoReview = async (card: Worksheet) => {
    const cardId = card._id ?? card.id;
    if (!cardId || !card.type) return;
    updateActionState(cardId, { autoReview: true });
    setError(null);
    setMissingFields([]);

    const response = await autoReview(card.type, cardId);

    updateActionState(cardId, { autoReview: false });

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    showToast("Auto-review generado.");
    loadCards();
  };

  const handleAutoUpload = async (card: Worksheet) => {
    const cardId = card._id ?? card.id;
    if (!cardId || !card.type) return;
    updateActionState(cardId, { autoUpload: true });
    setError(null);
    setMissingFields([]);

    const response = await autoUpload(card.type, cardId);

    updateActionState(cardId, { autoUpload: false });

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    showToast("Ficha publicada.");
    loadCards();
  };

  const handleReject = async (observation: string) => {
    if (!modalState.card) return;
    const cardId = modalState.card._id ?? modalState.card.id;
    if (!cardId) return;
    updateActionState(cardId, { reject: true });
    setError(null);
    setMissingFields([]);

    const response = await rejectCard(cardId, observation);

    updateActionState(cardId, { reject: false });

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    showToast("Ficha rechazada.");
    setModalState({ type: null, card: null });
    loadCards();
  };

  const handleReopen = async (observation: string) => {
    if (!modalState.card) return;
    const cardId = modalState.card._id ?? modalState.card.id;
    if (!cardId) return;
    updateActionState(cardId, { reopen: true });
    setError(null);
    setMissingFields([]);

    const response = await markPendingEdit(cardId, observation);

    updateActionState(cardId, { reopen: false });

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      return;
    }

    showToast("Ficha reabierta para edición.");
    setModalState({ type: null, card: null });
    loadCards();
  };

  const activeCards = cardsByStatus[activeTab] ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      {toastMessage && <Toast message={toastMessage} />}

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Acciones por ficha con backend local.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Crear ficha</h2>
        <p className="text-sm text-gray-500">
          Usa el endpoint /api/ingestion/worksheet para AuthorCard.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={createTitle}
            onChange={(event) => setCreateTitle(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Título"
          />
          <button
            onClick={handleCreateWorksheet}
            disabled={createLoading}
            className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createLoading ? "Creando..." : "Crear ficha"}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                activeTab === tab.key
                  ? "bg-d-blue text-white"
                  : "border border-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="mt-6 text-sm text-gray-500">Cargando fichas...</p>
        )}
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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

        {!loading && !error && (
          <div className="mt-6 grid gap-4">
            {activeCards.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay fichas para este estado.
              </p>
            ) : (
              activeCards.map((card) => {
                const cardId = card._id ?? card.id ?? "sin-id";
                const status = card.status ?? activeTab;
                const normalizedStatus = normalizeStatus(status);
                const cardActions = actionState[cardId] ?? {};

                return (
                  <div
                    key={cardId}
                    className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 p-4 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {card.title ?? "Sin título"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {card.type ?? "AuthorCard"} · {cardId}
                        </p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {card.observation && (
                      <p className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                        Última observación: {card.observation}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/cards/${cardId}`)}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        Abrir
                      </button>

                      {normalizedStatus === "pending-edit" && (
                        <button
                          type="button"
                          onClick={() => handleAutoReview(card)}
                          disabled={cardActions.autoReview}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {cardActions.autoReview
                            ? "Generando..."
                            : "🤖 Auto-review"}
                        </button>
                      )}

                      {normalizedStatus === "pending-review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAutoUpload(card)}
                            disabled={cardActions.autoUpload}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {cardActions.autoUpload
                              ? "Publicando..."
                              : "📤 Auto-upload"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setModalState({ type: "reject", card })
                            }
                            disabled={cardActions.reject}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            ❌ Rechazar
                          </button>
                        </>
                      )}

                      {normalizedStatus === "rejected" && (
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({ type: "reopen", card })
                          }
                          disabled={cardActions.reopen}
                          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          ♻️ Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <ObservationModal
        open={modalState.type === "reject"}
        title="Rechazar ficha"
        description="Deja una observación para el editor."
        placeholder="Rechazo de prueba: datos incompletos"
        confirmLabel="Rechazar"
        onClose={() => setModalState({ type: null, card: null })}
        onConfirm={handleReject}
        loading={actionState[getCardId(modalState.card)]?.reject}
      />

      <ObservationModal
        open={modalState.type === "reopen"}
        title="Reabrir ficha"
        description="Indica qué debe corregirse antes de volver a revisar."
        placeholder="Reabierta para correcciones"
        confirmLabel="Reabrir"
        onClose={() => setModalState({ type: null, card: null })}
        onConfirm={handleReopen}
        loading={actionState[getCardId(modalState.card)]?.reopen}
      />
    </div>
  );
}
