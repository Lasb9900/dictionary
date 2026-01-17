"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import {
  getPendingEditCards,
  getPendingReviewCards,
  getRejectedCards,
  markPendingEdit,
  rejectCard,
} from "@/src/services/cards";
import { StatusBadge } from "@/src/components/ingestion/StatusBadge";
import { ObservationModal } from "@/src/components/ingestion/ObservationModal";
import type { Worksheet } from "@/src/services/ingestion";
import { normalizeStatus } from "@/src/lib/status";

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

const BoardsPage = () => {
  const router = useRouter();
  const { checking } = useRequireAuth();
  const [activeTab, setActiveTab] = useState(STATUS_TABS[0].key);
  const [cardsByStatus, setCardsByStatus] = useState<
    Record<string, Worksheet[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    type: "reject" | "reopen" | null;
    card: Worksheet | null;
  }>({ type: null, card: null });
  const [modalLoading, setModalLoading] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    setError(null);

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
    if (!checking) {
      loadCards();
    }
  }, [checking]);

  const openEditor = (card: Worksheet) => {
    const id = card._id ?? card.id;
    const type = card.type ?? "AuthorCard";
    if (id) {
      router.push(`/ingestion/editor/${type}/${id}`);
    }
  };

  const handleReject = async (observation: string) => {
    if (!modalState.card) return;
    const id = modalState.card._id ?? modalState.card.id;
    if (!id) return;

    setModalLoading(true);
    const response = await rejectCard(id, observation);
    setModalLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      return;
    }

    setModalState({ type: null, card: null });
    loadCards();
  };

  const handleReopen = async (observation: string) => {
    if (!modalState.card) return;
    const id = modalState.card._id ?? modalState.card.id;
    if (!id) return;

    setModalLoading(true);
    const response = await markPendingEdit(id, observation);
    setModalLoading(false);

    if (!response.ok) {
      setError(response.error.message);
      return;
    }

    setModalState({ type: null, card: null });
    loadCards();
  };

  const activeCards = cardsByStatus[activeTab] ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Bandejas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona fichas por estado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/ingestion/create")}
          className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white"
        >
          Crear ficha
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
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

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {activeCards.length === 0 ? (
            <p className="text-sm text-gray-500">No hay fichas en esta bandeja.</p>
          ) : (
            activeCards.map((card) => {
              const cardId = card._id ?? card.id ?? "sin-id";
              const status = card.status ?? activeTab;
              const observation = card.observation;
              const normalizedStatus = normalizeStatus(status);

              return (
                <div
                  key={cardId}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
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

                  {observation && (
                    <p className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                      Última observación: {observation}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditor(card)}
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                    >
                      Abrir
                    </button>

                    {normalizedStatus === "pending-review" && (
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({ type: "reject", card })
                        }
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        ❌ Rechazar
                      </button>
                    )}

                    {normalizedStatus === "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({ type: "reopen", card })
                        }
                        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        ♻️ Reabrir para edición
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <ObservationModal
        open={modalState.type === "reject"}
        title="Rechazar ficha"
        description="Deja una observación para el editor."
        placeholder="Rechazo de prueba: datos incompletos"
        confirmLabel="Rechazar"
        onClose={() => setModalState({ type: null, card: null })}
        onConfirm={handleReject}
        loading={modalLoading}
      />

      <ObservationModal
        open={modalState.type === "reopen"}
        title="Reabrir ficha"
        description="Indica qué debe corregirse antes de volver a revisar."
        placeholder="Reabierta para correcciones"
        confirmLabel="Reabrir"
        onClose={() => setModalState({ type: null, card: null })}
        onConfirm={handleReopen}
        loading={modalLoading}
      />
    </div>
  );
};

export default BoardsPage;
