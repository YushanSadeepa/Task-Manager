interface Item {
  label: string;
  value: number;
  bar: string;
}

export function Distribution({ title, items, total }: { title: string; items: Item[]; total: number }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <ul className="space-y-3">
        {items.map((i) => {
          const pct = total ? Math.round((i.value / total) * 100) : 0;
          return (
            <li key={i.label}>
              <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{i.label}</span>
                <span>
                  {i.value} ({pct}%)
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={i.label}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <div className={`h-full rounded-full ${i.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
