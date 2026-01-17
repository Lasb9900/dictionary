"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/src/services/auth";
import { getStoredAuth } from "@/src/lib/authStorage";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (getStoredAuth()) {
      router.replace("/ingestion/boards");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMissingFields([]);
    setLoading(true);

    const response = await login(email, password);

    if (!response.ok) {
      setError(response.error.message);
      setMissingFields(response.error.missingFields ?? []);
      setLoading(false);
      return;
    }

    router.push("/ingestion/boards");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ingresa con tu usuario para administrar fichas.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="text-sm text-gray-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-d-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
      </div>
    </div>
  );
};

export default LoginPage;
