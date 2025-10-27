export type RubricStatus = 'active' | 'update-available';

export interface RubricRow {
  id?: string; // absent for new rows
  position: number;
  templateRowId?: string | null; // if derived from a template row
  task: string; // column 1
  aiUseLevel: string; // column 2
  instructions: string; // column 3
  examples: string; // column 4
  acknowledgement: string; // column 5
}

export interface TemplateRow {
  id?: string;
  position: number;
  task: string; // column 1
  aiUseLevel: string; // column 2
  instructions: string; // column 3
  examples: string; // column 4
  acknowledgement: string; // column 5
}

export interface Rubric {
  id: string;
  name: string;
  subjectCode: string; // e.g. "COMP30023"
  rowCount: number; // number of rubric rows
  version: number; // instance version
  templateId?: string | null; // if derived from template
  templateVersion?: number | null; // template version the instance was created from
  updatedAt: string; // ISO date string
  status: RubricStatus;
  ownerId: string; // current user id (fake for now)
  shared?: boolean;
  rows?: RubricRow[];
}

export interface RubricTemplate {
  id: string;
  name: string;
  version: number;
  subjectCode: string;
  rowCount: number;
  description?: string | null;
  updatedAt: string;
  createdBy: string;
  rows?: TemplateRow[];
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null; // path (e.g. '/avatars/avatar3.svg')
  created_at?: string;
  role?: 'admin' | 'user';
}

export interface TemplateUsageStats {
  template_id: string;
  template_name: string;
  subject_code: string;
  template_row_count: number;
  total_rubric_rows_using_template: number;
  unique_rubrics_using_template: number;
  template_rows_used: number;
  first_used_at: string | null;
  last_used_at: string | null;
  created_by_name?: string;
  created_by_email?: string;
}

export interface TemplateUsageDetail {
  rubric_id: string;
  rubric_name: string;
  rubric_subject_code: string;
  rows_from_template: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateUsageDetailResponse {
  template: {
    id: string;
    name: string;
    subject_code: string;
    row_count?: number;
  };
  usage: TemplateUsageDetail[];
  stats: {
    total_rubric_rows: number;
    unique_rubrics: number;
    template_rows_used: number;
    template_row_count: number;
  };
}
