'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rubric } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Trash, MoreVertical, Download } from 'lucide-react';
import * as React from 'react';

interface Props {
  rows: Rubric[];
  onExport: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export default function RubricTable({
  rows,
  onExport,
  onDeleteRequest,
}: Props) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/edit-rubric/${id}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Rows</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.id}
            onClick={() => handleRowClick(r.id)}
            tabIndex={0}
            role="button"
          >
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{r.subjectCode}</TableCell>
            <TableCell>{r.rowCount}</TableCell>
            <TableCell>
              {r.templateId ? `Yes (v${r.templateVersion ?? '?'})` : 'No'}
            </TableCell>
            <TableCell>{new Date(r.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {r.status === 'update-available' && (
                <Badge variant={"secondary"} className="animate-pulse">Update available</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onExport(r.id);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" /> Export (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(r.id);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
