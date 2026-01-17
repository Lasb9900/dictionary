'use client';

import { useEffect, useState } from 'react';
import {
  AiProvider,
  DEFAULT_AI_PROVIDER,
  getStoredAiProvider,
  setStoredAiProvider,
} from '@/src/ai/ai-provider';

interface AiProviderToggleProps {
  value?: AiProvider;
  onChange?: (provider: AiProvider) => void;
  className?: string;
  label?: string;
}

const PROVIDERS: { label: string; value: AiProvider }[] = [
  { label: 'Gemini', value: 'gemini' },
  { label: 'Ollama', value: 'ollama' },
];

export default function AiProviderToggle({
  value,
  onChange,
  className,
  label = 'Proveedor IA',
}: AiProviderToggleProps) {
  const [internalProvider, setInternalProvider] = useState<AiProvider>(
    value ?? getStoredAiProvider(),
  );

  useEffect(() => {
    if (value) {
      setInternalProvider(value);
      return;
    }

    setInternalProvider(getStoredAiProvider());
  }, [value]);

  const selectedProvider = value ?? internalProvider ?? DEFAULT_AI_PROVIDER;

  const handleSelect = (provider: AiProvider) => {
    setInternalProvider(provider);
    setStoredAiProvider(provider);
    onChange?.(provider);
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div className="flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {PROVIDERS.map((provider) => {
          const isActive = selectedProvider === provider.value;
          return (
            <button
              key={provider.value}
              type="button"
              onClick={() => handleSelect(provider.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? 'bg-d-blue text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={isActive}
            >
              {provider.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
