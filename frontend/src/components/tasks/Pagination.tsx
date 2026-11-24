import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types/task";
import { Button } from "@/components/ui/Button";

export function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (p: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between pt-4 text-sm text-slate-600 dark:text-slate-300">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} tasks
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Next page">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
