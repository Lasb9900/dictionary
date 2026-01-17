import { useState } from 'react';

interface ObservationModalProps {
    title: string;
    description: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: (observation: string) => Promise<void> | void;
}

export const ObservationModal = ({
    title,
    description,
    confirmLabel,
    onClose,
    onConfirm,
}: ObservationModalProps) => {
    const [observation, setObservation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        await onConfirm(observation);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
            <div className="w-full max-w-xl rounded-md bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 13L13 1M1 1L13 13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <p className="mb-4 text-sm text-gray-600">{description}</p>
                <textarea
                    rows={4}
                    value={observation}
                    onChange={(event) => setObservation(event.target.value)}
                    placeholder="Escribe la observación aquí..."
                    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-700 focus:border-d-blue focus:outline-none focus:ring-1 focus:ring-d-blue"
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="rounded-md bg-d-blue px-4 py-2 text-sm text-white disabled:opacity-60"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
