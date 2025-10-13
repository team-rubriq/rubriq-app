import { Rubric, RubricTemplate } from './types';

// Shared acknowledgement string for brevity
const UNI_MELB_ACK = `Students MUST acknowledge the use of AI by adding a declaration at the end of their submission.
(UniMelb's instruction on acknowledging AI tools and technologies: https://students.unimelb.edu.au/academic-skills/resources/academic-integrity/acknowledging-AI-tools-and-technologies)`;

// Example block used in several rows
const GENERAL_LEARNING_EXAMPLES = `Scenario 1: You ask an AI, "What are the typical steps involved in conducting a case study analysis, from initial reading to final recommendations?"
YES — This is a general question about methodology. You are learning about the process, not asking the AI to do it for you.

Scenario 2: You ask an AI, "What makes a recommendation in a case study analysis 'well-justified'? What sort of evidence or criteria should I use to support my proposed solutions?"
YES — You are learning principles of strong, evidence-based argumentation.

Scenario 3: You upload your case study file to an AI and ask, "Read this document and tell me the central problem the company is facing."
NO — This is a core part of the assessment you must do yourself.`;

export const sampleRubrics: Rubric[] = [
  {
    id: 'rb-1',
    name: 'Design of Algorithms (Project 1)',
    subjectCode: 'COMP20007',
    rowCount: 12,
    version: 3,
    templateId: 'tpl-100',
    templateVersion: 4, // template newer than instance → update available
    updatedAt: '2025-09-18T11:12:00.000Z',
    status: 'update-available',
    ownerId: 'me',
    shared: false,
    rows: [
      {
        id: 'rb1-row-1',
        templateRowId: 'tpl100-row-1',
        task: 'Task 1 — Background research',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI only to survey high-level ideas (divide-and-conquer, greedy, DP). Do NOT request a bespoke algorithm for your exact prompt.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position: 1,
      },
      {
        id: 'rb1-row-2',
        templateRowId: 'tpl100-row-2',
        task: 'Task 2 — Problem specification & constraints',
        aiUseLevel: 'No AI',
        instructions:
          'State inputs/outputs and constraints yourself; do not outsource extraction/interpretation to AI.',
        examples: `YES — Manually enumerate constraints from the PDF brief.
NO — Paste the brief into AI to summarise constraints for you.`,
        acknowledgement: UNI_MELB_ACK,
        position: 2,
      },
      {
        id: 'rb1-row-3',
        templateRowId: 'tpl100-row-3',
        task: 'Task 3 — Coding',
        aiUseLevel: 'AI-assisted coding',
        instructions:
          'AI allowed for small idioms (I/O scaffolding, test harness shell). Core algorithm and invariants must be authored by you.',
        examples: `YES — Ask “show example of binary heap API in language X”, then integrate.
NO — “Implement Dijkstra for my graph input format and return final code.”`,
        acknowledgement: UNI_MELB_ACK,
        position: 3,
      },
      {
        id: 'rb1-row-4',
        templateRowId: 'tpl100-row-4',
        task: 'Task 4 — Write-up',
        aiUseLevel: 'AI-assisted proofreading',
        instructions:
          'Grammar/clarity OK; no new content or analysis. Ensure the explanation of correctness and complexity is yours.',
        examples: `YES — “Polish tone and fix grammar for this paragraph.”
NO — “Write the correctness proof of my approach.”`,
        acknowledgement: UNI_MELB_ACK,
        position: 4,
      },
    ],
  },
  {
    id: 'rb-2',
    name: 'Software Modelling & Design (Group Project)',
    subjectCode: 'SWEN30006',
    rowCount: 8,
    version: 1,
    templateId: null,
    templateVersion: undefined,
    updatedAt: '2025-09-10T08:45:00.000Z',
    status: 'active',
    ownerId: 'me',
    shared: true,
    rows: [
      {
        id: 'rb2-row-1',
        task: 'Task 1 — Background research (UML, patterns)',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI to learn UML basics and common patterns. Do not ask it to design your exact system.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position: 1,
      },
      {
        id: 'rb2-row-2',
        task: 'Task 2 — Domain modelling',
        aiUseLevel: 'No AI',
        instructions:
          'Identify entities/relationships yourself; this is a core assessed activity.',
        examples: `YES — Brainstorm with teammates and iterate diagrams.
NO — Provide your full brief to AI to generate the domain model.`,
        acknowledgement: UNI_MELB_ACK,
        position: 2,
      },
      {
        id: 'rb2-row-3',
        task: 'Task 3 — Design write-up',
        aiUseLevel: 'AI-assisted proofreading',
        instructions:
          'Language polishing only; architecture decisions and rationale must be your own.',
        examples: `YES — Ask for grammar/style suggestions on a paragraph.
NO — Ask AI to justify your architecture for you.`,
        acknowledgement: UNI_MELB_ACK,
        position: 3,
      },
    ],
  },
  {
    id: 'rb-3',
    name: 'Computer Systems (Project 2)',
    subjectCode: 'COMP30023',
    rowCount: 10,
    version: 2,
    templateId: 'tpl-200',
    templateVersion: 2,
    updatedAt: '2025-08-29T16:24:00.000Z',
    status: 'active',
    ownerId: 'me',
    shared: false,
    rows: [
      {
        id: 'rb3-row-1',
        templateRowId: 'tpl200-row-1',
        task: 'Task 1 — Background research on sockets & HTTP',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI to clarify general networking concepts; do not feed your project code.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position: 1,
      },
      {
        id: 'rb3-row-2',
        templateRowId: 'tpl200-row-2',
        task: 'Task 2 — Implementation planning',
        aiUseLevel: 'No AI',
        instructions:
          'Design concurrency, buffer management, and error-handling yourself.',
        examples: `YES — Your own sequence/architecture diagrams.
NO — Auto-generated plan tailored to your exact spec.`,
        acknowledgement: UNI_MELB_ACK,
        position: 2,
      },
      {
        id: 'rb3-row-3',
        templateRowId: 'tpl200-row-3',
        task: 'Task 3 — Coding (network stack)',
        aiUseLevel: 'AI-assisted coding',
        instructions:
          'Permitted for small idioms; core concurrency & I/O logic must be authored by you.',
        examples: `YES — Ask for an example of non-blocking I/O loop; adapt to project.
NO — Request full proxy solution matching your rubric.`,
        acknowledgement: UNI_MELB_ACK,
        position: 3,
      },
    ],
  },
  {
    id: 'rb-4',
    name: 'Computer Systems (Project 1)',
    subjectCode: 'COMP30023',
    rowCount: 10,
    version: 1,
    templateId: 'tpl-200',
    templateVersion: 2,
    updatedAt: '2025-08-01T16:24:00.000Z',
    status: 'active',
    ownerId: 'me',
    shared: false,
    rows: [
      {
        id: 'rb4-row-1',
        templateRowId: 'tpl200-row-1',
        task: 'Task 1 — Background research on sockets & HTTP',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI for broad understanding only; avoid dataset/code specifics.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position: 1,
      },
      {
        id: 'rb4-row-2',
        templateRowId: 'tpl200-row-3',
        task: 'Task 2 — Coding (network stack)',
        aiUseLevel: 'AI-assisted coding',
        instructions: 'Boilerplate/snippets OK; core logic by you.',
        examples: `YES — Ask how to structure a select()-based loop.
NO — Ask AI to implement your assignment end-to-end.`,
        acknowledgement: UNI_MELB_ACK,
        position: 2,
      },
    ],
  },
  {
    id: 'rb-5',
    name: 'Information Security & Privacy (Written Assignment)',
    subjectCode: 'INFO30026',
    rowCount: 5,
    version: 5,
    templateId: null,
    templateVersion: undefined,
    updatedAt: '2025-05-01T16:24:00.000Z',
    status: 'active',
    ownerId: 'me',
    shared: false,
    rows: [
      {
        id: 'rb5-row-1',
        task: 'Task 1 — Background research (privacy frameworks)',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI to learn about GDPR principles and threat-modelling concepts. Do not request tailored analysis of your case study.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position: 1,
      },
      {
        id: 'rb5-row-2',
        task: 'Task 2 — Write-up',
        aiUseLevel: 'AI-assisted proofreading',
        instructions:
          'Language polishing only; argument, citations, and ethical analysis must be yours.',
        examples: `YES — “Improve clarity of this paragraph (no new ideas).”
NO — “Draft the ethical analysis section for me.”`,
        acknowledgement: UNI_MELB_ACK,
        position: 2,
      },
    ],
  },
];

export const sampleTemplates: RubricTemplate[] = [
  {
    id: 'tpl-100',
    name: 'Design of Algorithms (Coding Assignment Template)',
    version: 5,
    subjectCode: 'COMP20007',
    rowCount: 10,
    description: '',
    updatedAt: '2025-09-12T10:22:00.000Z',
    createdBy: 'admin',
    rows: [
      {
        id: 'tpl100-row-1',
        task: 'Task 1 — Background research',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI only to understand broad context (e.g., algorithm paradigms, high-level trade-offs). Do NOT ask for a solution to your exact problem or dataset.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position:1
      },
      {
        id: 'tpl100-row-2',
        task: 'Task 2 — Problem specification & constraints',
        aiUseLevel: 'No AI',
        instructions:
          'Define the exact problem statement, inputs/outputs, constraints, and assumptions independently. This is core assessment work.',
        examples: `YES — You write the constraints based on the brief and lecture notes.
NO — You paste the full brief into an AI and ask it to extract constraints.`,
        acknowledgement: UNI_MELB_ACK,
        position:2
      },
      {
        id: 'tpl100-row-3',
        task: 'Task 3 — Coding',
        aiUseLevel: 'AI-assisted coding',
        instructions:
          'You may use AI to suggest boilerplate, standard data structures, or small code snippets, but the algorithmic core must be authored by you.',
        examples: `YES — Ask for a generic priority queue pattern, then implement your own Dijkstra variant.
NO — Paste your full task and request a complete implementation.`,
        acknowledgement: UNI_MELB_ACK,
        position:3
      },
      {
        id: 'tpl100-row-4',
        task: 'Task 4 — Write-up',
        aiUseLevel: 'AI-assisted proofreading',
        instructions:
          'You may use AI for grammar/clarity suggestions. Substantive explanation, complexity analysis, and derivations must be your own.',
        examples: `YES — “Rewrite this paragraph for clarity (no new content).”
NO — “Write the complexity analysis for my solution given this code.”`,
        acknowledgement: UNI_MELB_ACK,
        position:4
      },
    ],
  },
  {
    id: 'tpl-200',
    name: 'Computer Systems (Coding Project Template)',
    version: 2,
    subjectCode: 'COMP30023',
    rowCount: 8,
    description: '',
    updatedAt: '2025-08-31T09:05:00.000Z',
    createdBy: 'admin',
    rows: [
      {
        id: 'tpl200-row-1',
        task: 'Task 1 — Background research on sockets & HTTP',
        aiUseLevel: 'AI for general learning',
        instructions:
          'Use AI to learn concepts like TCP vs UDP, HTTP message format, and common pitfalls. Do not request tailored solutions to your codebase.',
        examples: GENERAL_LEARNING_EXAMPLES,
        acknowledgement: UNI_MELB_ACK,
        position:1
      },
      {
        id: 'tpl200-row-2',
        task: 'Task 2 — Implementation planning',
        aiUseLevel: 'No AI',
        instructions:
          'Design module boundaries, error-handling strategy, and logging format yourself. Planning is a core assessable skill.',
        examples: `YES — Hand-drawn or authored by you system diagrams.
NO — “Generate a design doc for my exact spec and constraints.”`,
        acknowledgement: UNI_MELB_ACK,
        position:2
      },
      {
        id: 'tpl200-row-3',
        task: 'Task 3 — Coding (network stack)',
        aiUseLevel: 'AI-assisted coding',
        instructions:
          'Permitted for boilerplate snippets (e.g., select/poll usage patterns). The concurrency model and core logic must be written and justified by you.',
        examples: `YES — Ask how to parse HTTP headers in C safely; adapt to your project.
NO — Ask for a complete proxy implementation tailored to your brief.`,
        acknowledgement: UNI_MELB_ACK,
        position:3
      },
    ],
  },
];

/** Mock fetchers (server-side compatible) */
export async function getRubricById(id: string): Promise<Rubric | null> {
  return sampleRubrics.find((r) => r.id === id) ?? null;
}

export async function getTemplateById(
  id: string,
): Promise<RubricTemplate | null> {
  return sampleTemplates.find((t) => t.id === id) ?? null;
}
