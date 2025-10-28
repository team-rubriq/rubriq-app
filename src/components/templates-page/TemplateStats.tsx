// components/templates/

'use client';

import * as React from 'react';
import { TemplateUsageStats } from '@/lib/types';
import { TemplateAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';
import StatisticsCard from './StatisticsCard';

export default function TemplateStatistics() {
  const [stats, setStats] = React.useState<TemplateUsageStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await TemplateAPI.getUsageStatistics();
        if (!alive) return;
        setStats(data);
      } catch (e: any) {
        toast.error('Failed to load statistics', { description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter(
      (s) =>
        s.template_name.toLowerCase().includes(q) ||
        s.subject_code.toLowerCase().includes(q),
    );
  }, [stats, query]);

  const totalUses = stats.reduce(
    (sum, s) => sum + s.total_rubric_rows_using_template,
    0,
  );
  const totalRubrics = stats.reduce(
    (sum, s) => sum + s.unique_rubrics_using_template,
    0,
  );
  const avgUsesPerTemplate =
    totalRubrics > 0 ? (totalUses / totalRubrics).toFixed(1) : '0';

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 bg-background px-10 py-3">
        <h1 className="text-[44px] font-semibold tracking-tight">
          Template Usage Statistics
        </h1>
        <p className="text-m text-muted-foreground">
          View how templates are being used across rubrics
        </p>
      </div>

      <div className="flex flex-col pt-33 px-10 gap-8">
        {/* Summary Cards */}
        {!loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Rows Linked
                    </p>
                    <p className="text-3xl font-bold">{totalUses}</p>
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
                      Total Rubrics Linked
                    </p>
                    <p className="text-3xl font-bold">{totalRubrics}</p>
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
                      Average Number of Rows Linked per Rubric
                    </p>
                    <p className="text-3xl font-bold">{avgUsesPerTemplate}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3 items-center">
          <input
            className="h-9 w-full max-w-[440px] rounded-md border px-3 text-sm bg-background"
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="border rounded-2xl p-10 text-center">
            <h3 className="text-lg font-medium">No statistics found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {query
                ? 'Try a different search'
                : 'No templates have been used yet'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <StatisticsCard key={s.template_id} stats={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
