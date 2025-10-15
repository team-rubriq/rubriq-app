'use client';

import * as React from 'react';
import { RubricTemplate } from '@/lib/types';
import { TemplateAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TemplateCard from './TemplateCard';
import ConfirmDeleteDialog from '../my-rubrics-page/ConfirmDeleteDialog';

type SortKey = 'updated' | 'name' | 'subject';
type ViewKey = 'grid' | 'list';

export default function TemplatesHomeClient({
  initialTemplates = [],
  isAdmin = false,
}: {
  initialTemplates?: RubricTemplate[];
  isAdmin?: boolean;
}) {
  const [templates, setTemplates] =
    React.useState<RubricTemplate[]>(initialTemplates);
  const [loading, setLoading] = React.useState(false);
  const [view, setView] = React.useState<ViewKey>('grid');
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('updated');
  const [deleteTarget, setDeleteTarget] = React.useState<RubricTemplate | null>(
    null,
  );

  // Fetch only if SSR gave nothing
  React.useEffect(() => {
    if (initialTemplates.length) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const list = await TemplateAPI.list();
        if (!alive) return;
        setTemplates(list);
      } catch (e: any) {
        toast.error('Failed to load templates', { description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialTemplates.length]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = [...templates];
    if (q) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subjectCode.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      if (sort === 'updated')
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.subjectCode.localeCompare(b.subjectCode);
    });
    return rows;
  }, [templates, query, sort]);

  const requestDelete = (id: string) => {
    const item = templates.find((t) => t.id === id) || null;
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deleted = deleteTarget;

    // optimistic remove
    setTemplates((prev) => prev.filter((t) => t.id !== deleted.id));
    setDeleteTarget(null);

    try {
      await TemplateAPI.delete(deleted.id);
      toast.success('Template deleted', {
        description: `"${deleted.name}" was permanently removed.`,
      });
    } catch (e: any) {
      // Roll back if API fails
      setTemplates((prev) => [deleted, ...prev]);
      toast.error('Delete failed', { description: e.message });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 bg-background px-10 py-3">
        <h1 className="text-[44px] font-semibold tracking-tight">Templates</h1>
        <p className="text-m text-muted-foreground">
          {isAdmin
            ? 'Create, search, and manage shared templates as an admin.'
            : 'Browse shared templates as a subject coordinator.'}
        </p>
      </div>

      <div className="flex flex-col pt-33 px-10 gap-8">
        {/* Minimal toolbar */}
        <div className="flex gap-3 items-center justify-between">
          <input
            className="h-9 w-full max-w-[440px] rounded-md border px-3 text-sm bg-background"
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isAdmin && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const created = await TemplateAPI.create({
                    name: `New Template (${(new Date()).toISOString().slice(0, 10)})`,
                    subjectCode: 'SUBJ00000',
                    description: '',
                    rows: [],
                  });
                  setTemplates((cur) => [created, ...cur]);
                  toast.success('Template created');
                } catch (e: any) {
                  toast.error('Create failed', { description: e.message });
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Create template
            </Button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="border rounded-2xl p-10 text-center">
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search{' '}
              {isAdmin ? 'or create a new template.' : ''}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                item={t}
                isAdmin={isAdmin}
                onDeleteRequest={requestDelete}
              />
            ))}
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          itemName={deleteTarget?.name}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
