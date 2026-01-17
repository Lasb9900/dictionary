"use client";

import { AuthForm } from "../../../forms/components/AuthForm/AuthForm";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const LoginForm: React.FC = () => {
  const { data: session, status } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const resolveDashboardByRoles = (roles: string[]) => {
    if (roles.includes("admin")) return "/dashboard/worksheets/validatedSheets";
    if (roles.includes("editor") && !roles.includes("reviewer"))
      return "/dashboard/worksheets/sheetsToComplete";
    if (roles.includes("reviewer") && !roles.includes("editor"))
      return "/dashboard/worksheets/sheetsToReview";
    if (roles.includes("editor") && roles.includes("reviewer"))
      return "/dashboard/worksheets/sheetsToComplete";
    return "/dashboard/searcher"; // fallback seguro
  };

  const handleSubmit = async (values: any) => {
    setError(null);

    startTransition(async () => {
      // si next-auth te manda callbackUrl, úsalo
      const callbackUrl = searchParams.get("callbackUrl") || undefined;

      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: callbackUrl ?? undefined,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      // ✅ si login fue OK, redirige ya (sin esperar a useSession)
      // si viene callbackUrl, úsalo; si no, manda al dashboard por defecto
      const roles = (session as any)?.user?.roles ?? [];
const target = resolveDashboardByRoles(roles);

      router.push(target);
      router.refresh(); // fuerza a que server components/middleware lean la cookie
    });
  };

  // ✅ respaldo: si ya está autenticado (por ejemplo recarga), redirige por roles
  useEffect(() => {
    if (status !== "authenticated") return;

    const roles = (session as any)?.user?.roles ?? [];
    const target = resolveDashboardByRoles(roles);

    router.push(target);
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/tepuis.webp')` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto my-auto">
        <AuthForm
          formTitle="Iniciar Sesión"
          inputs={[
            {
              id: "email",
              name: "email",
              type: "email",
              labelText: "Correo electrónico",
              placeholder: "",
            },
            {
              id: "password",
              name: "password",
              type: "password",
              labelText: "Contraseña",
              placeholder: "",
            },
          ]}
          buttonText="Ingresar"
          linkQuestion="¿No tienes una cuenta?"
          linkText="Regístrate"
          linkHref="/auth/register"
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
          error={error}
          isPending={isPending}
        />
      </div>
    </div>
  );
};

export default LoginForm;
