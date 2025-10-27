// components/templates/TemplateStatisticsDetail.tsx

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TemplateUsageDetailResponse } from '@/lib/types';
import { TemplateAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BarChart3,
  Layers,
  Rows3,
  Zap,
  Link2,
} from 'lucide-react';

interface Props {
  templateId: string;
}

export default function TemplateStatisticsDetail({ templateId }: Props) {
  const router = useRouter();
  const [data, setData] = React.useState<TemplateUsageDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const result = await TemplateAPI.getUsageDetails(templateId);
        if (!alive) return;
        setData(result);
      } catch (e: any) {
        toast.error('Failed to load details', { description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [templateId]);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.usage;
    return data.usage.filter(
      (u) =>
        u.rubric_name.toLowerCase().includes(q) ||
        u.rubric_subject_code.toLowerCase().includes(q),
    );
  }, [data, query]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute top-0 left-0 w-full z-10 bg-background px-10 py-3">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex flex-col pt-33 px-10 gap-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-10 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/statistics')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Statistics
        </Button>
        <h1 className="text-[44px] font-semibold tracking-tight">
          {data.template.name}
        </h1>
        <p className="text-m text-muted-foreground">
          {data.template.subject_code} • Template Usage Details
        </p>
      </div>

      <div className="flex flex-col px-10 gap-8">
        {/* Summary Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Template Rows</p>
                  <p className="text-3xl font-bold">
                    {data.stats.template_row_count}
                  </p>
                </div>
                <Rows3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Rubrics Linked
                  </p>
                  <p className="text-3xl font-bold">
                    {data.stats.unique_rubrics}
                  </p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Rubric Rows Linked
                  </p>
                  <p className="text-3xl font-bold">
                    {data.stats.total_rubric_rows}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Number of Rows Linked per Rubric
                  </p>
                  <p className="text-3xl font-bold">
                    {(
                      data.stats.total_rubric_rows / data.stats.unique_rubrics
                    ).toFixed(2)}
                  </p>
                </div>
                <Link2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Template Efficiency
                  </p>
                  <p className="text-3xl font-bold">
                    {(
                      (data.stats.total_rubric_rows /
                        data.stats.unique_rubrics /
                        data.stats.template_row_count) *
                      100
                    ).toFixed(2)}{' '}
                    %
                  </p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-3 items-center">
          <input
            className="h-9 w-full max-w-[440px] rounded-md border px-3 text-sm bg-background"
            placeholder="Search rubrics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Rubrics Table */}
        {filtered.length === 0 ? (
          <div className="border rounded-2xl p-10 text-center">
            <h3 className="text-lg font-medium">No rubrics found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {query ? 'Try a different search' : 'This template has no usage'}
            </p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Rubrics Using This Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.map((usage) => (
                  <div
                    key={usage.rubric_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/edit-rubric/${usage.rubric_id}?readonly=true`,
                      )
                    }
                  >
                    <div className="flex-1">
                      <div className="font-medium">{usage.rubric_name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {usage.rubric_subject_code} • {usage.rows_from_template}{' '}
                        row
                        {usage.rows_from_template !== 1 ? 's' : ''} from
                        template
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last updated:{' '}
                        {new Date(usage.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {usage.rows_from_template} rows linked
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
