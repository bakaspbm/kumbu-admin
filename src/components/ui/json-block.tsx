export function JsonBlock({
  label,
  data,
}: {
  label: string;
  data: unknown;
}) {
  const text =
    data === null || data === undefined
      ? "—"
      : JSON.stringify(data, null, 2);

  return (
    <div className="space-y-1.5">
      <p className="kumbu-label">{label}</p>
      <pre className="max-h-48 overflow-auto rounded-chip border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        {text}
      </pre>
    </div>
  );
}
