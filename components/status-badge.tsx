export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
      {label}
    </span>
  );
}
