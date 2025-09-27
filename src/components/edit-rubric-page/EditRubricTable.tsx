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
import { EllipsisVerticalIcon, Link } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from 'lucide-react';
import { RubricRow, TemplateRow } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface Props {
  rows: RubricRow[];
  onChange: (rows: RubricRow[]) => void;
  templateRows: TemplateRow[];
  dirty: boolean;
}

function findTemplateRow(trs: TemplateRow[], id?: string | null) {
  return trs.find((t) => t.id === id);
}

export default function RubricRowsTable({
  rows,
  onChange,
  templateRows,
  dirty,
}: Props) {
  const update = (i: number, patch: Partial<RubricRow>) => {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const addRow = (i?: number) => {
    const idx = typeof i === 'number' ? i + 1 : rows.length;
    const id = `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const blank: RubricRow = {
      id,
      task: '',
      aiUseLevel: '',
      instructions: '',
      examples: '',
      acknowledgement: '',
    };
    const next = rows.slice();
    next.splice(idx, 0, blank);
    onChange(next);
  };

  const duplicateRow = (i: number) => {
    const src = rows[i];
    const dupe: RubricRow = { ...src, id: `row-${Date.now()}` };
    const next = rows.slice();
    next.splice(i + 1, 0, dupe);
    onChange(next);
  };

  const deleteRow = (i: number) => {
    const next = rows.slice();
    next.splice(i, 1);
    onChange(next);
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
            Click any cell to type. Use
            <span className="mx-1">
              <Badge variant="secondary">
                <kbd>⌘/Ctrl </kbd>+<kbd>S</kbd>{' '}
              </Badge>
            </span>
            to save.
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
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const trow = findTemplateRow(templateRows, r.templateRowId);
              const linked = !!trow;
              return (
                <TableRow
                  key={r.id}
                  className="divide-x divide-border h-[300px]"
                >
                  <TableCell className="py-3 text-center align-top relative text-xs text-muted-foreground">
                    <div className="pb-3">{i + 1}</div>
                    {linked && <div>(linked)</div>}
                  </TableCell>
                  {/* editable cells */}
                  <TableCell className="text-left align-top p-0 relative">
                    <Textarea
                      value={r.task}
                      onChange={(e) => update(i, { task: e.target.value })}
                      className="w-full h-full absolute inset-0 resize-none rounded-none border-none"
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
                    />
                    {linked &&
                      trow &&
                      r.acknowledgement !== trow.acknowledgement && (
                        <CellChanged />
                      )}
                  </TableCell>

                  <TableCell className="align-top flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => duplicateRow(i)}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addRow(i)}>
                          <Plus className="h-4 w-4 mr-2" /> Add below
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteRow(i)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
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
    </div>
  );
}

function CellChanged() {
  return (
    <Badge
      variant="secondary"
      className="absolute left-2 bottom-2 border-border pointer-events-none"
    >
      {' '}
      Changed from template{' '}
    </Badge>
  );
}
