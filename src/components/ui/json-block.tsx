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
      : Array.isArray(data) && data.length === 0
        ? "[]"
        : JSON.stringify(data, null, 2);

  return (
    <div className="space-y-1.5">
      <p className="kumbu-label">{label}</p>
      <pre className="kumbu-code-block">{text}</pre>
    </div>
  );
}
