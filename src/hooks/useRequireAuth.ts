"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth, StoredAuth } from "@/src/lib/authStorage";

export const useRequireAuth = () => {
  const router = useRouter();
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored) {
      router.replace("/ingestion/login");
      setChecking(false);
      return;
    }

    setAuth(stored);
    setChecking(false);
  }, [router]);

  return { auth, checking };
};
