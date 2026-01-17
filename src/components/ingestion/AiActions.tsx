"use client";

type AiActionsProps = {
  canAutoReview: boolean;
  canAutoUpload: boolean;
  autoReviewEnabled: boolean;
  autoUploadEnabled: boolean;
  onToggleAutoReview: (value: boolean) => void;
  onToggleAutoUpload: (value: boolean) => void;
  onAutoReview: () => void;
  onAutoUpload: () => void;
  onAutoOrchestrate: () => void;
  loading?: {
    autoReview?: boolean;
    autoUpload?: boolean;
    autoOrchestrate?: boolean;
  };
};

export const AiActions = ({
  canAutoReview,
  canAutoUpload,
  autoReviewEnabled,
  autoUploadEnabled,
  onToggleAutoReview,
  onToggleAutoUpload,
  onAutoReview,
  onAutoUpload,
  onAutoOrchestrate,
  loading,
}: AiActionsProps) => (
  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAutoReview}
        disabled={!canAutoReview || loading?.autoReview}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading?.autoReview ? "Generando..." : "🤖 Generar (Auto-review)"}
      </button>
      <button
        type="button"
        onClick={onAutoUpload}
        disabled={!canAutoUpload || loading?.autoUpload}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading?.autoUpload ? "Publicando..." : "📤 Publicar (Auto-upload)"}
      </button>
      <button
        type="button"
        onClick={onAutoOrchestrate}
        disabled={loading?.autoOrchestrate}
        className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading?.autoOrchestrate
          ? "Ejecutando..."
          : "⚡ Auto (Guardar + IA)"}
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={autoReviewEnabled}
          onChange={(event) => onToggleAutoReview(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-d-blue"
        />
        Auto-review
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={autoUploadEnabled}
          onChange={(event) => onToggleAutoUpload(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-d-blue"
        />
        Auto-upload
      </label>
    </div>
  </div>
);
