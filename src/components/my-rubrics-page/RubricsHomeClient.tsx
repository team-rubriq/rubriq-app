'use client';

import * as React from 'react';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import RubricsToolbar from './RubricsToolbar';
import RubricCard from './RubricCard';
import RubricTable from './RubricTable';
import CreateRubricModal, { CreateRubricPayload } from './CreateRubricModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Rubric, RubricRow, RubricTemplate, TemplateRow } from '@/lib/types';
import { toast } from 'sonner';
import * as XLSX from 'xlsx-js-style';
import { Plus } from 'lucide-react';
import { RubricAPI, TemplateAPI } from '@/lib/api';

type SortKey = 'updated' | 'name' | 'subject';
type FilterKey = 'all' | 'mine' | 'shared' | 'updates';
type ViewKey = 'grid' | 'list';

interface Props {
  initialData?: Rubric[];
  initialTemplates?: RubricTemplate[];
  currentUserId?: string;
  profileName?: string;
}

export default function RubricsHomeClient({
  initialData = [],
  initialTemplates = [],
  currentUserId,
  profileName = '',
}: Props) {
  const [rubrics, setRubrics] = React.useState<Rubric[]>(initialData);
  const [templates, setTemplates] =
    React.useState<RubricTemplate[]>(initialTemplates);
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('updated');
  const [filter, setFilter] = React.useState<FilterKey>('all');
  const [view, setView] = React.useState<ViewKey>('grid');
  const [loading, setLoading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Rubric | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  // Load rubrics & templates (Supabase API call)
  React.useEffect(() => {
    let alive = true;

    if (initialData.length && initialTemplates.length) return;

    (async () => {
      try {
        setLoading(true);
        const [list, tpls] = await Promise.all([
          initialData.length ? Promise.resolve(initialData) : RubricAPI.list(),
          initialTemplates.length
            ? Promise.resolve(initialTemplates)
            : TemplateAPI.list(),
        ]);
        if (!alive) return;
        setRubrics(list);
        setTemplates(tpls);
      } catch (e: any) {
        toast.error('Failed to load data', { description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Display filtered, searched, and sorted rubrics
  const filtered = React.useMemo(() => {
    let rows = [...rubrics];

    // filter
    rows = rows.filter((r) => {
      if (filter === 'updates') return r.status === 'update-available';
      if (filter === 'shared') return !!r.shared;
      if (filter === 'mine') {
        // If currentUserId is provided, use it; else treat "mine" as "not shared"
        return currentUserId
          ? r.ownerId === currentUserId && !r.shared
          : !r.shared;
      }
      return true;
    });

    // search
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q),
      );
    }

    // sort
    rows.sort((a, b) => {
      if (sort === 'updated') {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.subjectCode.localeCompare(b.subjectCode);
    });

    return rows;
  }, [rubrics, query, sort, filter, currentUserId]);

  // Export rubric handler (export to XLSX)
  const handleExport = async (id: string) => {
    try {
      const r = await RubricAPI.get(id); // ensures rows are present
      if (!r?.rows?.length) {
        toast.message('No rows to export yet.');
        return;
      }

      // Prepare data for Excel: header + rows
      const rubricHeaders = [
        'Task',
        'AI Use Level',
        'Instructions',
        'Examples',
        'Acknowledgement',
      ];

      const studentHeaders = [
        'AI Tools Used',
        'Purpose and Usage',
        'Key Prompts Used (if any)',
      ];

      const headerRow1 = [
        ...rubricHeaders,
        'Student Declaration (please complete this section)',
        '',
        '',
      ];

      const headerRow2 = [
        ...Array(rubricHeaders.length).fill(''),
        ...studentHeaders,
      ];

      const dataRows = r.rows.map((row) => [
        row.task,
        row.aiUseLevel,
        row.instructions,
        row.examples,
        row.acknowledgement,
        '', // AI tools used
        '', // Purpose and usage
        '', // Key prompts
      ]);

      const data = [headerRow1, headerRow2, ...dataRows];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      worksheet['!merges'] = [
        ...rubricHeaders.map((_, idx) => ({
          s: { r: 0, c: idx },
          e: { r: 1, c: idx },
        })),
        {
          s: { r: 0, c: rubricHeaders.length }, // start at first student declaration col
          e: { r: 0, c: rubricHeaders.length + 2 }, // end at last student declaration col
        },
      ];

      // Assign column widths (in characters)
      worksheet['!cols'] = [
        { wch: 56 }, // Task
        { wch: 38 }, // AI Use Level
        { wch: 35 }, // Instructions
        { wch: 80 }, // Examples
        { wch: 34 }, // Acknowledgement
        { wch: 28 }, // AI Tools Used (Student Declaration)
        { wch: 28 }, // Purpose and Usage (Student Declaration)
        { wch: 28 }, // Key prompts (Student Declaration)
      ];

      // Header row heights
      worksheet['!rows'] = [{ hpt: 15 }, { hpt: 32 }];

      // Style header rows
      for (let R = 0; R < 2; ++R) {
        for (let C = 0; C < rubricHeaders.length + studentHeaders.length; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cell_address]) continue;

          const isRubricHeader = C < rubricHeaders.length;

          worksheet[cell_address].s = {
            font: {
              bold: true,
              color: { rgb: isRubricHeader ? 'FFFFFF' : '000000' },
            },
            fill: {
              patternType: 'solid',
              fgColor: { rgb: isRubricHeader ? '294880' : 'A9D08E' },
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: true,
            },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
        }
      }

      // Style data rows
      for (let R = 2; R < data.length; ++R) {
        for (let C = 0; C < rubricHeaders.length + studentHeaders.length; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cell_address]) continue;
          worksheet[cell_address].s = {
            alignment: { wrapText: true, vertical: 'top' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
        }
      }

      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'rubric');

      // Export to file
      XLSX.writeFile(
        workbook,
        `${r.name.replace(/\s+/g, '_').toLowerCase()}.xlsx`,
      );
    } catch (e: any) {
      toast.error('Export failed', { description: e.message });
    }
  };

  // Request delete: open confirmation dialog for rubric
  const requestDelete = (id: string) => {
    const item = rubrics.find((r) => r.id === id) || null;
    setDeleteTarget(item);
  };

  // Confirm delete: remove rubric from state (Supabase API call)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deleted = deleteTarget;

    // Optimistically remove it from the UI
    setRubrics((prev) => prev.filter((r) => r.id !== deleted.id));
    setDeleteTarget(null);

    try {
      await RubricAPI.delete(deleted.id);
      toast.success('Rubric deleted', {
        description: `"${deleted.name}" was permanently removed.`,
      });
    } catch (e: any) {
      // Roll back if API fails
      setRubrics((prev) => [deleted, ...prev]);
      toast.error('Delete failed', { description: e.message });
    }
  };

  // Create rubric handler (Supabase API call)
  const handleCreate = async (payload: CreateRubricPayload) => {
    try {
      const created = await RubricAPI.create(payload);
      setRubrics((prev) => [created, ...(prev ?? [])]);
      setCreateOpen(false);
      toast.success('Rubric created', {
        description:
          payload.mode === 'template'
            ? payload.linkForUpdates
              ? 'Linked to template for future updates.'
              : 'Copied from template (not linked).'
            : 'Started from scratch.',
      });
    } catch (e: any) {
      toast.error('Create failed', { description: e.message });
    }
  };

  // Total rubrics count
  const totalCount = rubrics.length;

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 bg-background px-10 py-3">
        <h1 className="text-[44px] font-semibold tracking-tight">
          {profileName ? `Welcome, ${profileName}!` : 'My Rubrics'}
        </h1>
        <p className="text-m text-muted-foreground">
          Create, search, and manage your rubrics.
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-col pt-33 px-10 gap-8">
        {/* Toolbar for search, filter, sort, view, and create */}
        <RubricsToolbar
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
          filter={filter}
          onFilter={setFilter}
          view={view}
          onView={setView}
          totalCount={totalCount}
          onCreateRubric={() => setCreateOpen(true)}
        />

        {/* Loading state */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state: no rubrics match filters */}
        {!loading && filtered.length === 0 && (
          <div className="border rounded-2xl p-10 text-center">
            <h3 className="text-lg font-medium">
              No rubrics match your filters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting search or create a new rubric from scratch or a
              template.
            </p>
            <Button
              variant={'outline'}
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create rubric
            </Button>
          </div>
        )}

        {/* Data: grid or table view */}
        {!loading &&
          filtered.length > 0 &&
          (view === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => (
                <RubricCard
                  key={r.id}
                  item={r}
                  onExport={handleExport}
                  onDeleteRequest={requestDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border">
              <RubricTable
                rows={filtered}
                onExport={handleExport}
                onDeleteRequest={requestDelete}
              />
            </div>
          ))}

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          itemName={deleteTarget?.name}
          onConfirm={confirmDelete}
        />

        {/* Create Rubric Modal */}
        <CreateRubricModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          templates={templates ?? []}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
