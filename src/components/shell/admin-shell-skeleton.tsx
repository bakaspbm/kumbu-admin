export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-100 bg-white" />
      <div className="flex flex-1 min-w-0 flex-col">
        <header className="h-16 border-b border-slate-100 bg-white" />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-64 rounded-xl bg-slate-100" />
          </div>
        </main>
      </div>
    </div>
  );
}
