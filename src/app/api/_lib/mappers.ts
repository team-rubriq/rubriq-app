// src/app/api/_lib/mappers.ts
import type {
  Rubric,
  RubricRow,
  RubricTemplate,
  TemplateRow,
} from '@/lib/types';

export function mapRubricRow(rw: any): RubricRow {
  return {
    id: rw.id,
    position: rw.position ?? 0,
    templateRowId: rw.template_row_id,
    task: rw.task ?? '',
    aiUseLevel: rw.ai_use_level ?? '',
    instructions: rw.instructions ?? '',
    examples: rw.examples ?? '',
    acknowledgement: rw.acknowledgement ?? '',
  };
}

export function mapRubric(r: any, rows?: any[]): Rubric {
  return {
    id: r.id,
    name: r.name,
    subjectCode: r.subject_code,
    version: r.version,
    rowCount: r.row_count ?? rows?.length ?? 0,
    status: r.status,
    templateId: r.template_id,
    templateVersion: r.template_version,
    updatedAt: r.updated_at,
    shared: r.shared ?? false,
    ownerId: r.owner_id, // convenient for UI
    rows: rows ? rows.map(mapRubricRow) : undefined,
  };
}

export function mapTemplateRow(tw: any): TemplateRow {
  return {
    id: tw.id,
    position: tw.position ?? 0,
    task: tw.task ?? '',
    aiUseLevel: tw.ai_use_level ?? '',
    instructions: tw.instructions ?? '',
    examples: tw.examples ?? '',
    acknowledgement: tw.acknowledgement ?? '',
  };
}

export function mapTemplate(t: any, rows?: any[]): RubricTemplate {
  return {
    id: t.id,
    name: t.name,
    subjectCode: t.subject_code,
    version: t.version,
    rowCount: t.row_count ?? rows?.length ?? 0,
    description: t.description ?? '',
    updatedAt: t.updated_at,
    createdBy: t.created_by,
    rows: rows ? rows.map(mapTemplateRow) : undefined,
  };
}
