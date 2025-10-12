'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rubric, RubricRow, RubricTemplate, TemplateRow } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '../ui/badge';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rubric: Rubric;
  template: RubricTemplate;
  onApply: (selectedRubricRowIds: string[]) => void | Promise<void>;
}

export default function TemplateUpdatesSheet({
  open,
  onOpenChange,
  rubric,
  template,
  onApply,
}: Props) {
  // Map template rows by id
  const tmap = React.useMemo(
    () => new Map((template.rows ?? []).map((r) => [r.id, r])),
    [template.rows],
  );

  // Build diff model only for linked rows
  type DiffItem = {
    idx: number;
    rubricRowId: string; // rubric_rows.id (needed for RPC)
    r: RubricRow;
    t: TemplateRow | null;
    changed: boolean; // true if any field differs
  };

  // figure out which linked rows differ
  const diffs: DiffItem[] = React.useMemo(() => {
    return (rubric.rows ?? [])
      .map((r, idx) => {
        if (!r.templateRowId) {
          return { idx, rubricRowId: r.id!, r, t: null, changed: false };
        }
        const t = tmap.get(r.templateRowId) ?? null;
        const changed =
          !!t &&
          (r.task !== t.task ||
            r.aiUseLevel !== t.aiUseLevel ||
            r.instructions !== t.instructions ||
            r.examples !== t.examples ||
            r.acknowledgement !== t.acknowledgement);
        return { idx, rubricRowId: r.id!, r, t, changed };
      })
      .filter(Boolean) as DiffItem[];
  }, [rubric.rows, tmap]);

  // Selection state uses rubricRowId
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // When sheet opens, preselect only rows that differ and have template linkage
    if (!open) return;
    const pre = new Set<string>();
    diffs.forEach((d) => {
      if (d.t && d.changed && d.rubricRowId) pre.add(d.rubricRowId);
    });
    setSelected(pre);
  }, [open, diffs]);

  const toggle = (rubricRowId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(rubricRowId);
      else next.delete(rubricRowId);
      return next;
    });
  };

  const apply = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await onApply(ids); // parent handles RPC + refresh
  };

  const changedCount = diffs.filter((d) => d.t && d.changed).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>Template updates</SheetTitle>
          <SheetDescription>
            Template <code>{template.id}</code> version:{' '}
            <span className="text-chart-5">v{template.version}</span>
            <br />
            Your rubric version:{' '}
            <span className="text-chart-5">
              v{rubric.templateVersion ?? '?'}
            </span>
            <br />
            {changedCount > 0 ? (
              <span>
                Select rows to apply the newer template text.
                <Badge className="ml-2" variant="secondary">
                  {changedCount} differences
                </Badge>
              </span>
            ) : (
              <span>No differnces detected for linked rows</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-0 pr-4 overflow-y-auto">
          <div className="space-y-4">
            {diffs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No linked rows present.
              </p>
            )}
            {diffs.map(({ idx, r, t, changed, rubricRowId }) => (
              <div key={rubricRowId ?? idx} className="rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.has(rubricRowId)}
                    onCheckedChange={(v) => toggle(rubricRowId, !!v)}
                    disabled={!t || !changed || !rubricRowId}
                  />
                  <div className="text-sm font-medium">
                    Row {idx + 1}{' '}
                    {r.templateRowId ? (
                      <span className="text-muted-foreground">
                        · linked {r.templateRowId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        · not linked
                      </span>
                    )}
                  </div>
                  {t && changed && (
                    <Badge className="ml-2" variant="outline">
                      differs
                    </Badge>
                  )}
                </div>

                {t ? (
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-semibold">
                        Your rubric{' '}
                        <span className="text-chart-5">
                          v{rubric.templateVersion ?? '?'}
                        </span>
                      </div>
                      <Field name="Task" value={r.task} />
                      <Field name="AI Use Scale Level" value={r.aiUseLevel} />
                      <Field
                        name="Instructions to Students"
                        value={r.instructions}
                      />
                      <Field name="Examples" value={r.examples} />
                      <Field
                        name="AI Use Acknowlegement"
                        value={r.acknowledgement}
                      />
                    </div>
                    <div>
                      <div className="font-semibold">
                        Template{' '}
                        <span className="text-chart-5">
                          v{template.version}
                        </span>
                      </div>
                      <Field name="Task" value={t.task} />
                      <Field name="AI Use Scale Level" value={t.aiUseLevel} />
                      <Field
                        name="Instructions to Students"
                        value={t.instructions}
                      />
                      <Field name="Examples" value={t.examples} />
                      <Field
                        name="AI Use Acknowlegement"
                        value={t.acknowledgement}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">
                    This rubric row is linked to a template row that no longer
                    exists.
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={apply} disabled={selected.size === 0}>
            Apply selected
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ name, value }: { name: string; value: string }) {
  return (
    <div className="mt-1">
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="rounded-lg border bg-muted/30 px-2 py-1 break-words whitespace-normal">
        {value || <span className="opacity-60">(empty)</span>}
      </div>
    </div>
  );
}
