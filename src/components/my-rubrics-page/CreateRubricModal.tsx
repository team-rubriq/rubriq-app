'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import TemplateCombobox from './TemplateCombobox';
import { RubricTemplate } from '@/lib/types';

type Mode = 'scratch' | 'template';

export interface CreateRubricPayloadScratch {
  mode: 'scratch';
  name: string;
  subjectCode: string;
  initialRows: number; // purely frontend hint
}

export interface CreateRubricPayloadTemplate {
  mode: 'template';
  name: string; // default to template name but editable
  subjectCode: string; // default to template subject
  templateId: string; // selected template id
  linkForUpdates: boolean; // if true, keep row links to enable template updates
}

export type CreateRubricPayload =
  | CreateRubricPayloadScratch
  | CreateRubricPayloadTemplate;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: RubricTemplate[];
  onCreate: (payload: CreateRubricPayload) => void;
}

export default function CreateRubricModal({
  open,
  onOpenChange,
  templates,
  onCreate,
}: Props) {
  const [mode, setMode] = React.useState<Mode>('scratch');

  // "From scratch" fields
  const [name, setName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [rows, setRows] = React.useState<number>(10);

  // "From template" fields
  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [tName, setTName] = React.useState('');
  const [tSubject, setTSubject] = React.useState('');
  const [linkForUpdates, setLinkForUpdates] = React.useState(true);

  // when template changes, prefill name + subject
  React.useEffect(() => {
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setTName((prev) => prev || tpl.name);
      setTSubject(tpl.subjectCode);
    }
  }, [templateId, templates]);

  const reset = () => {
    setMode('scratch');
    setName('');
    setSubject('');
    setRows(10);
    setTemplateId(null);
    setTName('');
    setTSubject('');
    setLinkForUpdates(true);
  };

  const handleCreate = () => {
    // create from scratch
    if (mode === 'scratch') {
      if (!name.trim() || !subject.trim()) return;
      onCreate({
        mode: 'scratch',
        name: name.trim(),
        subjectCode: subject.trim().toUpperCase(),
        initialRows: Math.max(1, Math.min(50, rows || 10)),
      });
      reset();
      onOpenChange(false);
      return;
    }
    // create from template
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    const finalName = (tName || tpl?.name || '').trim();
    const finalSubject = (tSubject || tpl?.subjectCode || '').trim();
    if (!finalName || !finalSubject) return;

    onCreate({
      mode: 'template',
      name: finalName,
      subjectCode: finalSubject.toUpperCase(),
      templateId,
      linkForUpdates,
    });
    reset();
    onOpenChange(false);
  };

  // basic validation state
  const isValid =
    mode === 'scratch'
      ? name.trim().length > 0 && subject.trim().length > 0
      : !!templateId && tName.trim().length > 0 && tSubject.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create rubric</DialogTitle>
          <DialogDescription>
            Start from scratch or derive from an admin template.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as Mode)}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scratch">From scratch</TabsTrigger>
            <TabsTrigger value="template">From template</TabsTrigger>
          </TabsList>

          {/* FROM SCRATCH */}
          <TabsContent value="scratch" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                placeholder="e.g. Foundations of Computing (Project 1)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-subject">Subject code</Label>
              <Input
                id="r-subject"
                placeholder="e.g. COMP10001"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => setSubject((s) => s.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-rows">Initial number of rows</Label>
              <Input
                id="r-rows"
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setRows(
                    Number.isFinite(n) ? Math.max(1, Math.min(50, n)) : 10,
                  );
                }}
              />
            </div>
          </TabsContent>

          {/* FROM TEMPLATE */}
          <TabsContent value="template" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Select template</Label>
              <TemplateCombobox
                templates={templates}
                value={templateId}
                onChange={setTemplateId}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t-name">Name</Label>
                <Input
                  id="t-name"
                  placeholder="Derived rubric name"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-subject">Subject code</Label>
                <Input
                  id="t-subject"
                  placeholder="e.g. COMP10001"
                  value={tSubject}
                  readOnly
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="font-medium">Link to template for updates</div>
                <p className="text-sm text-muted-foreground">
                  Keeps each derived row linked so you can accept template row
                  changes later.
                </p>
              </div>
              <Switch
                disabled={!templateId}
                checked={linkForUpdates}
                onCheckedChange={setLinkForUpdates}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
