// components/templates/StatisticsCard.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Layers } from 'lucide-react';
import { TemplateUsageStats } from '@/lib/types';

interface Props {
  stats: TemplateUsageStats;
}

export default function StatisticsCard({ stats }: Props) {
  const router = useRouter();

  return (
    <Card
      className="flex flex-col min-w-[300px] min-h-[200px] hover:bg-muted cursor-pointer"
      onClick={() => router.push(`/statistics/${stats.template_id}`)}
      tabIndex={0}
      role="button"
    >
      <CardHeader>
        <CardTitle className="text-base">{stats.template_name}</CardTitle>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{stats.subject_code}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Total Rows Linked</span>
          </div>
          <Badge variant="secondary">
            {stats.total_rubric_rows_using_template}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Total Rubrics Linked</span>
          </div>
          <Badge variant="secondary">
            {stats.unique_rubrics_using_template}
          </Badge>
        </div>

        {stats.last_used_at && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Last used: {new Date(stats.last_used_at).toLocaleDateString()}
          </div>
        )}

        {stats.created_by_name && (
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Users size={14} />
            <span>Created by {stats.created_by_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
