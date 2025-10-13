export type RubricStatus = "active" | "update-available";

export interface RubricRow {
  id?: string;                   // absent for new rows
  position: number;
  templateRowId?: string | null; // if derived from a template row
  task: string;                  // column 1
  aiUseLevel: string;            // column 2
  instructions: string;          // column 3
  examples: string;              // column 4
  acknowledgement: string;       // column 5
}

export interface TemplateRow {
  id?: string;
  position: number;
  task: string;                  // column 1
  aiUseLevel: string;            // column 2
  instructions: string;          // column 3
  examples: string;              // column 4
  acknowledgement: string;       // column 5
}

export interface Rubric {
  id: string;
  name: string;
  subjectCode: string;             // e.g. "COMP30023"
  rowCount: number;                // number of rubric rows
  version: number;                 // instance version
  templateId?: string | null;      // if derived from template
  templateVersion?: number | null; // template version the instance was created from
  updatedAt: string;               // ISO date string
  status: RubricStatus;
  ownerId: string;                 // current user id (fake for now)
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
