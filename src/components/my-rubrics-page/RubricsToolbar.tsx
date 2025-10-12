'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Plus, List, LayoutGrid, ChevronDown } from 'lucide-react';

type SortKey = 'updated' | 'name' | 'subject';
type FilterKey = 'all' | 'mine' | 'shared' | 'updates';
type ViewKey = 'grid' | 'list';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  filter: FilterKey;
  onFilter: (f: FilterKey) => void;
  view: ViewKey;
  onView: (v: ViewKey) => void;
  totalCount: number;
  onCreateRubric?: () => void;
}

export default function RubricsToolbar({
  query,
  onQuery,
  sort,
  onSort,
  filter,
  onFilter,
  view,
  onView,
  totalCount,
  onCreateRubric,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search, Sort, View */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search rubrics by name or subject…"
          className="w-[340px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort by <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onSort('updated')}>
              Last updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort('name')}>
              Name (A–Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort('subject')}>
              Subject code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant={view === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onView('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onView('list')}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs and Create Button */}
      <div className="flex items-center gap-2 justify-between">
        <Tabs value={filter} onValueChange={(v) => onFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant={'outline'} onClick={onCreateRubric}>
          <Plus className="h-4 w-4" />
          Create rubric
        </Button>
      </div>
    </div>
  );
}
