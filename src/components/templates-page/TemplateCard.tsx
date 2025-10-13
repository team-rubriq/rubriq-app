// src/components/templates-page/TemplateCard.tsx
'use client';

import { useRouter } from 'next/navigation';
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
import { MoreVertical, Layers, Upload, Trash } from 'lucide-react';
import { RubricTemplate } from '@/lib/types';
import { TemplateAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  item: RubricTemplate;
  isAdmin: boolean;
  onDeleteRequest?: (id: string) => void;
}

export default function TemplateCard({
  item,
  isAdmin,
  onDeleteRequest,
}: Props) {
  const router = useRouter();

  const publish = async () => {
    try {
      const next = await TemplateAPI.publishNewVersion(item.id);
      toast.success(`Published v${next.version}`);
      router.refresh?.();
    } catch (e: any) {
      toast.error('Failed to publish', { description: e.message });
    }
  };

  return (
    <Card
      className="flex flex-col min-w-[300px] min-h-[200px] hover:bg-muted"
      onClick={() => router.push(`/edit-template/${item.id}`)}
      tabIndex={0}
      role="button"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{item.name}</CardTitle>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{item.subjectCode}</span>
            <span>•</span>
            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{item.rowCount} rows</span>
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">v{item.version}</Badge>
          </div>
        </div>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={publish}>
                <Upload className="mr-2 h-4 w-4" /> Publish new version
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest?.(item.id);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground mt-auto">
        <p>{item.description || '—'}</p>
      </CardContent>
    </Card>
  );
}
