import type {
  Rubric,
  RubricRow,
  RubricTemplate,
  TemplateRow,
} from '@/lib/types';

// Helper function to parse fetch responses and throw errors for non-OK responses
async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      msg = body.error?.message ?? body.message ?? JSON.stringify(body);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// RubricAPI: Provides functions to interact with rubric-related API endpoints
export const RubricAPI = {
  // List all rubrics
  list: async (): Promise<Rubric[]> =>
    j<Rubric[]>(await fetch('/api/rubrics/list', { cache: 'no-store' })),

  // Get a single rubric by ID
  get: async (id: string): Promise<Rubric> =>
    j<Rubric>(await fetch(`/api/rubrics/${id}`, { cache: 'no-store' })),

  // Create a new rubric (from scratch or from a template)
  create: async (
    payload:
      | {
          mode: 'scratch';
          name: string;
          subjectCode: string;
          initialRows: number;
        }
      | {
          mode: 'template';
          name: string;
          subjectCode: string;
          templateId: string;
          linkForUpdates: boolean;
        },
  ): Promise<Rubric> =>
    j<Rubric>(
      await fetch('/api/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ),

  // Rename a rubric
  rename: async (
    id: string,
    name: string,
    subjectCode?: string,
  ): Promise<Rubric> =>
    j<Rubric>(
      await fetch(`/api/rubrics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subjectCode }),
      }),
    ),

  // Delete a rubric
  delete: async (id: string): Promise<void> => {
    const r = await fetch(`/api/rubrics/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  },

  // Save (update) rubric rows
  saveRows: async (
    id: string,
    rows: RubricRow[],
    bumpVersion = true,
  ): Promise<Rubric> =>
    j<Rubric>(
      await fetch(`/api/rubrics/${id}/rows`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: rows.map((r, i) => ({ ...r, position: i })),
          bumpVersion,
        }),
      }),
    ),

  // Apply template updates to a rubric
  applyTemplateUpdates: async (
    id: string,
    acceptRowIds: string[],
  ): Promise<Rubric> =>
    j<Rubric>(
      await fetch(`/api/rubrics/${id}/apply-template-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptRowIds }),
      }),
    ),
};

// TemplateAPI: Provides functions to interact with template-related API endpoints
export const TemplateAPI = {
  // List all templates
  list: async (): Promise<RubricTemplate[]> =>
    j<RubricTemplate[]>(
      await fetch('/api/templates/list', { cache: 'no-store' }),
    ),

  // Get a single template by ID
  get: async (id: string): Promise<RubricTemplate> =>
    j<RubricTemplate>(
      await fetch(`/api/templates/${id}`, { cache: 'no-store' }),
    ),

  // Create a new template (admin only)
  create: async (payload: {
    name: string;
    subjectCode: string;
    description?: string;
    rows: TemplateRow[];
  }): Promise<RubricTemplate> =>
    j<RubricTemplate>(
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ),

  // Rename a template (admin only)
  rename: async (
    id: string,
    name: string,
    subjectCode?: string,
  ): Promise<RubricTemplate> =>
    j<RubricTemplate>(
      await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subjectCode }),
      }),
    ),

  // Update template rows (admin only)
  updateRows: async (
    id: string,
    rows: TemplateRow[],
    bumpVersion = true,
  ): Promise<RubricTemplate> =>
    j<RubricTemplate>(
      await fetch(`/api/templates/${id}/rows`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, bumpVersion }),
      }),
    ),

  // Publish a new version of a template (admin only)
  publishNewVersion: async (id: string): Promise<RubricTemplate> =>
    j<RubricTemplate>(
      await fetch(`/api/templates/${id}/publish`, { method: 'POST' }),
    ),

  // Delete a template (admin only)
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        msg = body.error?.message ?? JSON.stringify(body);
      } catch {}
      throw new Error(msg);
    }
  },
};
