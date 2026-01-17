import { normalizeStatus } from "@/src/lib/status";

const STATUS_STYLES: Record<string, string> = {
  "pending-edit": "bg-yellow-100 text-yellow-800",
  "pending-review": "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  validated: "bg-green-100 text-green-800",
};

export const StatusBadge = ({ status }: { status?: string | null }) => {
  const normalized = normalizeStatus(status);
  const className = STATUS_STYLES[normalized] ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status ?? "Sin estado"}
    </span>
  );
};
