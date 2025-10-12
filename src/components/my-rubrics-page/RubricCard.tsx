'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Download, Trash } from 'lucide-react';
import { Rubric } from '@/lib/types';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface Props {
  item: Rubric;
  onExport: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export default function RubricCard({ item, onExport, onDeleteRequest }: Props) {
  const router = useRouter();

  const handleCardClick = React.useCallback(() => {
    router.push(`/edit-rubric/${item.id}`);
  }, [router, item.id]);

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(item.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest(item.id);
  };

  const updatedStr = React.useMemo(
    () => new Date(item.updatedAt).toLocaleDateString(),
    [item.updatedAt],
  );

  const statusBadge =
    item.status === 'update-available' ? (
      <Badge variant={'default'} className="animate-pulse">Template updates available</Badge>
    ) : null;

  return (
    <Card
      className="flex flex-col min-w-[300px] min-h-[200px] hover:bg-muted"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`Open ${item.name}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{item.name}</CardTitle>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{item.subjectCode}</span>
            <span aria-hidden>•</span>
            <span title={item.updatedAt}>Updated {updatedStr}</span>
            <span aria-hidden>•</span>
            <span>{item.rowCount} rows</span>
          </div>
          <div className="mt-2 flex gap-2">{statusBadge}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground mt-auto">
        {item.templateId ? (
          <p>
            Derived from template{' '}
            <span className="font-mono">{item.templateId}</span> (v
            {item.templateVersion ?? '?'})
          </p>
        ) : (
          <p>Created from scratch</p>
        )}
      </CardContent>
    </Card>
  );
}
