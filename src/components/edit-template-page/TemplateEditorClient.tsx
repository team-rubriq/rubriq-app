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
import { dir } from 'console';

export default function TemplateEditorClient({
  initialTemplate,
  isAdmin,
}: {
  initialTemplate: RubricTemplate;
  isAdmin: boolean;
}) {
  const [tpl, setTpl] = React.useState<RubricTemplate>(initialTemplate);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // unsaved-changes guard on hard navigation/refresh
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // keyboard shortcuts: Cmd/Ctrl+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tpl]);

  // Template name handler
  const setName = (name: string) => {
    setTpl((t) => ({ ...t, name }));
    setDirty(true);
  };

  // Subject name handler
  const setSubject = (subjectCode: string) => {
    setTpl((t) => ({ ...t, subjectCode }));
    setDirty(true);
  };

  // Rows handlers
  const onRowsChange = (rows: TemplateRow[]) => {
    setTpl((t) => ({ ...t, rows, rowCount: rows.length }));
    setDirty(true);
  };

  // Save: PATCH, then RPC, then refetch
  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);

      // Save metadata
      await TemplateAPI.rename(tpl.id, tpl.name, tpl.subjectCode);

      // save rows via RPC
      const rows = (tpl.rows ?? []).map((r, i) => ({ ...r, position: i }));
      const updated = await TemplateAPI.updateRows(tpl.id, rows, false);

      // refetch template
      const fresh = await TemplateAPI.get(tpl.id);
      setTpl(fresh);
      setDirty(false);
      toast.success('Saved', {
        description: `Template v${updated.version} saved.`,
      });
    } catch (e: any) {
      toast.error('Save failed', { description: e.message });
    } finally {
      setSaving(false);
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

  const handleRevert = async () => {
    try {
      const fresh = await TemplateAPI.get(tpl.id);
      setTpl(fresh);
      setDirty(false);
      toast.message('Reverted', {
        description: 'Returned to last saved state.',
      });
    } catch (e: any) {
      toast.error('Revert failed', { description: e.message });
    }
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
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <>
                <span title="Revert Changes">
                  <Button variant="ghost" onClick={handleRevert}>
                    <Undo />
                  </Button>
                </span>
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
          dirty={dirty}
        />
      </div>
    </div>
  );
}
