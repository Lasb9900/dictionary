"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/src/lib/api";

type Card = {
  _id?: string;
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  createdBy?: { _id?: string; fullName?: string; email?: string } | string;
  [key: string]: unknown;
};

type CardsByStatus = Record<string, Card[]>;

const STATUS_TABS = [
  { key: "pending-edit", label: "Pending Edit" },
  { key: "pending-review", label: "Pending Review" },
  { key: "validated", label: "Validated" },
  { key: "rejected", label: "Rejected" },
];

const normalizeCards = (data: unknown): Card[] => {
  if (Array.isArray(data)) {
    return data as Card[];
  }
  if (data && typeof data === "object") {
    const asRecord = data as { data?: unknown; items?: unknown };
    if (Array.isArray(asRecord.data)) {
      return asRecord.data as Card[];
    }
    if (Array.isArray(asRecord.items)) {
      return asRecord.items as Card[];
    }
  }
  return [];
};

export default function CardsPage() {
  const { data: session } = useSession();
  const [cardsByStatus, setCardsByStatus] = useState<CardsByStatus>({});
  const [activeTab, setActiveTab] = useState(STATUS_TABS[0].key);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState("author");
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const token = session?.user?.token as string | undefined;
  const createdBy = session?.user?._id as string | undefined;

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchCards = async () => {
    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        STATUS_TABS.map(async ({ key }) => {
          const response = await apiFetch(`/cards/status/${key}`, {
            method: "GET",
            headers: authHeaders,
          });
          if (!response.ok) {
            throw new Error(response.message || "Error al obtener las fichas");
          }
          return [key, normalizeCards(response.data)] as const;
        })
      );

      const nextState: CardsByStatus = {};
      responses.forEach(([key, cards]) => {
        nextState[key] = cards;
      });
      setCardsByStatus(nextState);
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        setError(fetchError.message);
      } else {
        setError("No se pudieron cargar las fichas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorksheet = async () => {
    setCreateMessage(null);
    if (!createdBy) {
      setCreateMessage("Debes iniciar sesión para crear una ficha.");
      return;
    }
    if (!createTitle.trim()) {
      setCreateMessage("El título es obligatorio.");
      return;
    }

    try {
      const response = await apiFetch("/ingestion/worksheet", {
        method: "POST",
        headers: authHeaders,
        body: {
          type: createType,
          title: createTitle,
          createdBy,
        },
      });

      if (!response.ok) {
        setCreateMessage(response.message || "No se pudo crear la ficha.");
        return;
      }

      setCreateMessage("Ficha creada correctamente.");
      setCreateTitle("");
      await fetchCards();
    } catch (createError) {
      if (createError instanceof Error) {
        setCreateMessage(createError.message);
      } else {
        setCreateMessage("No se pudo crear la ficha.");
      }
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const activeCards = cardsByStatus[activeTab] ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Fichas / Cards</h1>
        <p className="text-sm text-gray-500">
          Vista mínima de fichas conectada al backend.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Crear ficha</h2>
        <p className="text-sm text-gray-500">
          Crea una worksheet usando el endpoint de ingestion.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={createTitle}
            onChange={(event) => setCreateTitle(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Título"
          />
          <select
            value={createType}
            onChange={(event) => setCreateType(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:w-48"
          >
            <option value="author">Autor</option>
            <option value="grouping">Agrupación</option>
            <option value="anthology">Antología</option>
            <option value="magazine">Revista</option>
          </select>
          <button
            onClick={handleCreateWorksheet}
            className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
          >
            Crear ficha (worksheet)
          </button>
        </div>
        {createMessage && (
          <p className="mt-3 text-sm text-gray-600">{createMessage}</p>
        )}
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
          <p className="mt-6 text-sm text-red-600">{error}</p>
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
                const createdByLabel =
                  typeof card.createdBy === "string"
                    ? card.createdBy
                    : card.createdBy?.fullName ??
                      card.createdBy?.email ??
                      card.createdBy?._id ??
                      "Sin asignar";

                return (
                  <button
                    key={cardId}
                    onClick={() => setSelectedCard(card)}
                    className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 p-4 text-left hover:border-d-blue"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {card.title ?? "Sin título"}
                      </h3>
                      <span className="text-xs uppercase text-gray-400">
                        {card.status ?? activeTab}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="mr-4">Tipo: {card.type ?? "N/A"}</span>
                      <span className="mr-4">
                        Creado:{" "}
                        {card.createdAt
                          ? new Date(card.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
                      <span>Creado por: {createdByLabel}</span>
                    </div>
                    <span className="text-xs text-d-blue">
                      Ver detalles (JSON)
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Detalles de la ficha
              </h2>
              <button
                onClick={() => setSelectedCard(null)}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-d-blue hover:text-d-blue"
              >
                Cerrar
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-xs text-gray-700">
              {JSON.stringify(selectedCard, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
