export type AiProvider = 'gemini' | 'ollama';

export const AI_PROVIDER_KEY = 'ai_provider';
export const DEFAULT_AI_PROVIDER: AiProvider = 'gemini';

const isAiProvider = (value: string | null): value is AiProvider =>
  value === 'gemini' || value === 'ollama';

export const getStoredAiProvider = (): AiProvider => {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_PROVIDER;
  }

  const stored = window.localStorage.getItem(AI_PROVIDER_KEY);
  return isAiProvider(stored) ? stored : DEFAULT_AI_PROVIDER;
};

export const setStoredAiProvider = (provider: AiProvider) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AI_PROVIDER_KEY, provider);
};
