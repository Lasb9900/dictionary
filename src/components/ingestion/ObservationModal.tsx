"use client";

import { useState } from "react";

type ObservationModalProps = {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (observation: string) => void;
  loading?: boolean;
};

export const ObservationModal = ({
  open,
  title,
  description,
  placeholder,
  confirmLabel,
  onClose,
  onConfirm,
  loading = false,
}: ObservationModalProps) => {
  const [observation, setObservation] = useState("");

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(observation);
    setObservation("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600"
          >
            Cerrar
          </button>
        </div>

        <textarea
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          placeholder={placeholder}
          className="mt-4 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
