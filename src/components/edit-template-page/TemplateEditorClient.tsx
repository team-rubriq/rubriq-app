// src/components/edit-template-page/TemplateEditorClient.tsx
'use client';

import * as React from 'react';
import { RubricTemplate, TemplateRow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Undo, Upload } from 'lucide-react';
import EditTemplateTable from './EditTemplateTable';
import { TemplateAPI } from '@/lib/api';

export default function TemplateEditorClient({
  initialTemplate,
  isAdmin,
}: {
  initialTemplate: RubricTemplate;
  isAdmin: boolean;
}) {
  const [tpl, setTpl] = React.useState<RubricTemplate>(initialTemplate);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const setName = (name: string) => {
    setTpl((t) => ({ ...t, name }));
    setDirty(true);
  };
  const setSubject = (subjectCode: string) => {
    setTpl((t) => ({ ...t, subjectCode }));
    setDirty(true);
  };
  const setDescription = (description: string) => {
    setTpl((t) => ({ ...t, description }));
    setDirty(true);
  };

  const onRowsChange = (rows: TemplateRow[]) => {
    setTpl((t) => ({ ...t, rows, rowCount: rows.length }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      const next = await TemplateAPI.updateRows(tpl.id, tpl.rows ?? [], true);
      // (Optional) add an endpoint to PATCH name/subject/description if you want to edit those too
      setTpl(next);
      setDirty(false);
      toast.success('Template saved');
    } catch (e: any) {
      toast.error('Save failed', { description: e.message });
    }
  };

  const handlePublish = async () => {
    if (!isAdmin) return;
    try {
      const next = await TemplateAPI.publishNewVersion(tpl.id);
      setTpl(next);
      setDirty(false);
      toast.success(`Published v${next.version}`);
    } catch (e: any) {
      toast.error('Publish failed', { description: e.message });
    }
  };

  const handleCancel = () => {
    setTpl(initialTemplate);
    setDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-md border-b">
        <div className="mx-auto max-w-screen-xl px-4 py-3 flex items-center gap-3">
          <Input
            className="text-xl font-semibold h-10"
            value={tpl.name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
          />
          <Input
            className="w-40"
            value={tpl.subjectCode}
            onChange={(e) => setSubject(e.target.value.toUpperCase())}
            disabled={!isAdmin}
          />
          <Input
            className="flex-1"
            placeholder="Description"
            value={tpl.description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAdmin}
          />
          <div className="ml-auto flex items-center gap-2">
            <span title="Revert Changes">
              <Button variant="ghost" onClick={handleCancel}>
                <Undo />
              </Button>
            </span>
            {isAdmin && (
              <>
                <span title="Save">
                  <Button
                    variant="ghost"
                    onClick={handleSave}
                    disabled={!dirty}
                  >
                    <Save />
                  </Button>
                </span>
                <span title="Publish new version">
                  <Button variant="ghost" onClick={handlePublish}>
                    <Upload />
                  </Button>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex mx-auto text-sm max-w-screen-xl px-5 text-muted-foreground">
        <div className="flex items-center gap-5">
          <div className="flex flex-row gap-2">
            <Badge variant="outline">Template ID</Badge>
            <code>{tpl.id}</code>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-row gap-2">
            <Badge variant="outline">Rows</Badge>
            <span>{tpl.rowCount}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-row gap-2">
            <Badge variant="outline">Version</Badge>
            <span>v{tpl.version}</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="mx-auto max-w-screen-xl px-4">
        <EditTemplateTable
          rows={tpl.rows ?? []}
          onChange={onRowsChange}
          readOnly={!isAdmin}
        />
      </div>
    </div>
  );
}
