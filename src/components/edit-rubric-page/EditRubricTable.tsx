'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EllipsisVerticalIcon, Trash, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { RubricRow, TemplateRow } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface Props {
  rows: RubricRow[];
  onChange: (rows: RubricRow[]) => void;
  templateRows: TemplateRow[];
  dirty: boolean;
  readOnly?: boolean;
}

function findTemplateRow(trs: TemplateRow[], id?: string | null) {
  return trs.find((t) => t.id === id);
}

export default function EditRubricTable({
  rows,
  onChange,
  templateRows,
  dirty,
  readOnly = false,
}: Props) {
  const reindex = (arr: RubricRow[]) =>
    arr.map((r, i) => ({ ...r, position: i }));

  const update = (i: number, patch: Partial<RubricRow>) => {
    if (readOnly) return;
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(reindex(next));
  };

  const addRow = (i?: number) => {
    if (readOnly) return;
    const idx = typeof i === 'number' ? i + 1 : rows.length;
    const blank: RubricRow = {
      position: idx,
      templateRowId: null,
      task: '',
      aiUseLevel: '',
      instructions: '',
      examples: '',
      acknowledgement: '',
    };
    const next = rows.slice();
    next.splice(idx, 0, blank);
    onChange(reindex(next));
  };

  const deleteRow = (i: number) => {
    if (readOnly) return;
    const next = rows.slice();
    next.splice(i, 1);
    onChange(reindex(next));
  };

  const columns = [
    'Task',
    'AI Use Level',
    'Student Instructions',
    'Examples',
    'AI Use Acknowledgement',
  ];

  return (
    <div>
      <div className="rounded-2xl border overflow-x-auto">
        <div className="p-3 flex justify-between items-center text-sm text-muted-foreground">
          <div className="">
            {readOnly ? (
              'Viewing in read-only mode'
            ) : (
              <>
                Click any cell to type. Use
                <span className="mx-1">
                  <Badge variant="secondary">
                    <kbd>⌘/Ctrl </kbd>+<kbd>S</kbd>{' '}
                  </Badge>
                </span>
                to save.
              </>
            )}
          </div>
          <div>{dirty && <div>Unsaved changes...</div>}</div>
        </div>

        <Table className="w-full table-fixed border">
          <TableHeader>
            <TableRow className="divide-x divide-border bg-chart-3/5 hover:bg-chart-3/5">
              <TableHead className="w-[70px]"></TableHead>
              {columns.map((c) => (
                <TableHead key={c} className="text-center font-bold">
                  {c}
                </TableHead>
              ))}
              {!readOnly && <TableHead className="w-[40px]"></TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r, i) => {
              const trow = findTemplateRow(templateRows, r.templateRowId);
              const linked = !!trow;

              return (
                <TableRow
                  key={r.id ?? `new-${i}`}
                  className="divide-x divide-border h-[300px]"
                >
                  <TableCell className="py-3 text-center align-top relative text-xs text-muted-foreground">
                    <div className="pb-3">{i + 1}</div>
                    {linked && <div>(linked)</div>}
                  </TableCell>

                  {/* Editable cells */}
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.task}
                      onChange={(e) => update(i, { task: e.target.value })}
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                    {linked && trow && r.task !== trow.task && <CellChanged />}
                  </TableCell>
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.aiUseLevel}
                      onChange={(e) =>
                        update(i, { aiUseLevel: e.target.value })
                      }
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                    {linked && trow && r.aiUseLevel !== trow.aiUseLevel && (
                      <CellChanged />
                    )}
                  </TableCell>
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.instructions}
                      onChange={(e) =>
                        update(i, { instructions: e.target.value })
                      }
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                    {linked && trow && r.instructions !== trow.instructions && (
                      <CellChanged />
                    )}
                  </TableCell>
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.examples}
                      onChange={(e) => update(i, { examples: e.target.value })}
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                    {linked && trow && r.examples !== trow.examples && (
                      <CellChanged />
                    )}
                  </TableCell>
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.acknowledgement}
                      onChange={(e) =>
                        update(i, { acknowledgement: e.target.value })
                      }
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
                      readOnly={readOnly}
                      disabled={readOnly}
                    />
                    {linked &&
                      trow &&
                      r.acknowledgement !== trow.acknowledgement && (
                        <CellChanged />
                      )}
                  </TableCell>

                  {/* Row actions - only show if not read-only */}
                  {!readOnly && (
                    <TableCell className="align-top flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Row actions"
                          >
                            <EllipsisVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem onClick={() => addRow(i)}>
                            <Plus className="h-4 w-4 mr-2" /> Add below
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteRow(i)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Only show add row button if not read-only */}
      {!readOnly && (
        <div className="mt-6 mb-20">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => addRow()}
          >
            <Plus className="size-4" /> Add row
          </Button>
        </div>
      )}
    </div>
  );
}

function CellChanged() {
  return (
    <Badge
      variant="default"
      className="absolute left-2 bottom-2 border-border pointer-events-none"
    >
      {' '}
      Changed from template{' '}
    </Badge>
  );
}
