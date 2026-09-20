/**
 * Single source of truth for every word on this site.
 *
 * Copy is drawn from two JD-targeted resumes (AI Software Engineer / Forward
 * Deployed Engineer) and cross-checked against the live public repos at
 * github.com/Adhrit-Verma. Where a repo and a resume disagree, the repo wins —
 * it is the artifact a reader can actually go and verify.
 *
 * Known divergence: Contrast's suite is 72 tests in the repo; both resume PDFs
 * still say 68. This file uses 72.
 */
export const LINKEDIN = "https://www.linkedin.com/in/adhrit-verma/";
export const GITHUB = "https://github.com/Adhrit-Verma";
const repo = (name: string) => `${GITHUB}/${name}`;

export const identity = {
  name: "Adhrit Verma",
  handle: "ADHRIT_VERMA",
  role: "AI Software Engineer",
  tagline: "Python · LLMs · RAG · MCP · React",
  stack: ["LangGraph", "RAG", "MCP", "Python"],
  location: "Bengaluru, India",
  email: "adhrit007@gmail.com",
  phone: "+91 90971 48424",
  employer: "Newru Technologies",
  since: "SEP 2023",
};

/** ctOS-profiler readout. Every number traces to a resume line or a live repo. */
export const stats = [
  { label: "Years in production", value: 3, prefix: "", suffix: "", note: "Since Sep 2023" },
  { label: "Production AI systems", value: 3, prefix: "", suffix: "", note: "Contrast · ClauseGuard · TableFox" },
  { label: "Tests across those pipelines", value: 162, prefix: "", suffix: "", note: "72 + 23 + 67, all passing" },
  { label: "Agent token usage cut", value: 29, prefix: "−", suffix: "%", note: "TableFox vs. full-schema baseline" },
];

export const summary =
  "AI Software Engineer with 3 years of production experience across Python, JavaScript/TypeScript (React), and applied Generative AI. Comfortable owning AI-integrated systems end to end: architecture, agent orchestration, retrieval design, and production delivery on cloud infrastructure. Architected Contrast, a LangGraph-orchestrated multi-agent pipeline with a RAG grounding layer; built ClauseGuard, a multi-agent contract-review system with hybrid keyword + semantic retrieval; and built TableFox, exposing PostgreSQL to AI agents via an MCP (Model Context Protocol) server.";

export const profileTraits = [
  { k: "Discipline", v: "AI systems, backend-first" },
  { k: "Specialism", v: "Agent orchestration · retrieval design" },
  { k: "Field posture", v: "Sole technical contact, 2+ yrs" },
  { k: "Domain", v: "Airline ops · HR · compliance" },
  { k: "Mode of operation", v: "Owns systems end-to-end" },
];

export const skillModules = [
  {
    id: "GENAI",
    title: "AI / ML / GenAI",
    items: [
      "Large Language Models",
      "LangChain",
      "LangGraph",
      "RAG",
      "Hybrid retrieval",
      "MCP",
      "AI agents",
      "Multi-agent orchestration",
      "Prompt engineering",
    ],
  },
  {
    id: "LANG",
    title: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "SQL"],
  },
  {
    id: "BACK",
    title: "Backend",
    items: ["FastAPI", "Node.js", "Express.js", "REST APIs", "RBAC"],
  },
  {
    id: "DATA",
    title: "Data & Vector",
    items: [
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "Local embeddings (Ollama)",
      "Schema design",
      "Query optimization",
    ],
  },
  {
    id: "FRNT",
    title: "Frontend",
    items: ["React.js", "Next.js", "HTML5", "CSS"],
  },
  {
    id: "INFRA",
    title: "Cloud & Delivery",
    items: ["AWS Lambda", "S3", "DynamoDB", "Docker", "GitLab CI/CD", "Git"],
  },
];

export const experience = [
  {
    org: "Newru Technologies Pvt. Ltd.",
    role: "Software Engineer (Sole Engineer)",
    period: "Sep 2023 – Present",
    location: "Bengaluru, India",
    stack: [
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Python",
      "React.js",
      "GitLab CI/CD",
    ],
    missions: [
      {
        code: "AVTK",
        name: "Aviatrack",
        subtitle: "Airline Crew & Operations Management Platform",
        log: [
          "Retained directly by the end client as sole technical point of contact after the engagement structure changed — owning requirements, architecture, delivery, and production support independently for 2+ years.",
          "Embedded directly with airline operations stakeholders to design deployments, troubleshoot issues, and translate undocumented workflows into a production platform delivering more than 90% of core operational needs.",
          "Delivered more than 90% of Aviatrack's core operational workflows — flight planning, crew assignment, PIC/SIC allocation, duty-time calculations, document expiry tracking, and reporting.",
          "Built REST APIs and Python/Node.js data-processing pipelines to automate multi-leg crew scheduling, validation rules, and exception handling, cutting recurring flight-planning effort by 40–50%.",
          "Encoded five DGCA regulatory compliance checks into enforced system rules (flight duty period, flight time, weekly rest, crew qualifications, document validity), lowering manual review errors by more than 30%.",
        ],
      },
      {
        code: "HRMW",
        name: "HRM Web Application",
        subtitle: "HR & Employee Management System",
        log: [
          "Directed backend and full-stack delivery of two role-specific portals (HR, Employee) built with React.js and Node.js, covering records, attendance, leave, compensation, payroll documents, onboarding, training, and device tracking.",
          "Reengineered PostgreSQL schemas, indexes, and queries to accelerate response times and eliminate recurring data-integrity defects.",
          "Cut manual follow-up across 5 recurring HR workflows by automating approvals, email notifications, document verification, attendance, and leave tracking.",
          "Strengthened security via RBAC, audit logging, secure session handling, and 2FA-ready flows — improving access control and traceability.",
        ],
      },
    ],
  },
];

/** Featured dossiers — the three production AI systems, each with a live repo. */
export const files = [
  {
    id: "F-01",
    code: "CNTR",
    name: "Contrast",
    kind: "AI-Assisted Accessibility Auditing & Remediation Platform",
    hook: "Fixes the accessibility failures automated scanners can only shrug at — then re-tests every fix in a fresh browser before daring to call it fixed.",
    stack: ["Node.js", "LangGraph", "Puppeteer", "Google Gemini API", "axe-core", "SQLite"],
    url: repo("Contrast"),
    body: [
      "Architected a 7-phase, LangGraph-orchestrated multi-agent pipeline composing Puppeteer crawling, axe-core/Lighthouse tooling, and Gemini-based judgment calls — validated end to end by a 72-test suite with zero axe violations in its own UI.",
      "Grounded AI-generated remediations in a RAG pipeline over WCAG 2.2 criteria and house patterns, re-verifying every fix via fresh-browser re-scans — a hand-built evaluation and regression loop for AI output quality.",
      "Extended audits to authenticated, login-gated apps with zero credentials stored, by detecting sign-in walls mid-crawl and persisting only an encrypted session (AES-256-GCM).",
      "Separates what it measured from what a model assessed, and states plainly that automated testing catches only 30–40% of WCAG issues — a capacity multiplier for human auditors, not a conformance claim.",
    ],
    metrics: [
      { k: "Pipeline phases", v: "7" },
      { k: "Test suite", v: "72" },
      { k: "Axe violations", v: "0" },
    ],
  },
  {
    id: "F-02",
    code: "CLGD",
    name: "ClauseGuard",
    kind: "Multi-Agent Contract & Policy Review Pipeline",
    hook: "Upload a contract, get back a risk verdict — so a human reviewer starts from a report instead of a blank document.",
    stack: ["Python", "FastAPI", "LangGraph", "Anthropic API", "Ollama", "Pydantic", "SQLite"],
    url: repo("ClauseGuard"),
    body: [
      "Architected a LangGraph pipeline of three specialized agents — Extractor, Risk Analyzer, Summarizer — that segments contracts into labeled clauses, validates them against a configurable rule set, and produces a plain-English risk verdict.",
      "Designed hybrid clause-matching retrieval: BM25 keyword search merged with local Ollama embeddings via reciprocal rank fusion, falling back automatically to keyword-only when no embedding model is available.",
      "Validated every inter-agent hand-off against a Pydantic schema and covered the pipeline with a 23-test suite using mocked LLM calls.",
      "Supports dual LLM backends — local Ollama for free offline runs, Anthropic API for higher-quality paid runs — chosen per run rather than baked in.",
    ],
    metrics: [
      { k: "Specialized agents", v: "3" },
      { k: "Test suite", v: "23" },
      { k: "LLM backends", v: "2" },
    ],
  },
  {
    id: "F-03",
    code: "TBFX",
    name: "TableFox",
    kind: "PostgreSQL Schema Intelligence for AI Agents (MCP Server)",
    hook: "An agent pointed at a database doesn't know the schema. Pasting the whole dump into every prompt is the usual fix — this is the better one.",
    stack: ["Python", "FastAPI", "MCP", "PostgreSQL", "Next.js", "pytest"],
    url: repo("TableFox"),
    body: [
      "Built an MCP (Model Context Protocol) server exposing guarded, read-only PostgreSQL access to AI agents, with EXPLAIN-plan and cost-ceiling validation before any query executes.",
      "Designed a BM25F-ranked searchable schema graph so agents locate the few relevant tables and columns instead of loading the full schema into context — cutting mean tokens per task from 1,240 to 879, a 29% reduction.",
      "Benchmarked warm median latency at 1,200 ms against 2,396 ms for a naive full-schema baseline, and documented the honest caveat: a cold MCP process pays setup cost and only pulls ahead from the second task onward.",
      "Covered the system with 67 pytest tests and ran it on a minimal-privilege, connection-pooled database role.",
    ],
    metrics: [
      { k: "Token usage", v: "−29%" },
      { k: "Warm median", v: "1,200ms" },
      { k: "pytest tests", v: "67" },
    ],
  },
];

/**
 * Recovered files — smaller builds, every one a real public repo.
 * Compact by design; the three above carry the weight.
 */
export const recovered = [
  {
    code: "TASX",
    name: "Two-Agent Self-Extending AI System",
    hook: "A User Agent answers requests; a Builder Agent writes a new skill when none exists — sandboxed and approved before it can ever be invoked.",
    stack: ["Python", "FastAPI"],
    url: repo("two-agent-self-extending-ai-system"),
  },
  {
    code: "GDC",
    name: "Gradient Dense Code",
    hook: "QR geometry carrying a second, separate payload in calibrated RGB — a normal scanner still reads the carrier; only the GDC decoder sees the color layer.",
    stack: ["Python", "zlib", "CRC32"],
    url: repo("GDC"),
  },
  {
    code: "LDQA",
    name: "LocalDocQA",
    hook: "Offline document Q&A on CPU — PyMuPDF extraction, chunked context, locally cached transformers, no internet and no data leaving the machine.",
    stack: ["Python", "Transformers", "PyMuPDF"],
    url: repo("LocalDocQA"),
  },
  {
    code: "ADIX",
    name: "AuDiX",
    hook: "Audio Distribution Exchange — low-latency audio broadcast across a local network, split into separate user and admin portals with role-based access.",
    stack: ["Node.js", "PostgreSQL"],
    url: repo("AuDix_User"),
  },
];

export const credentials = [
  {
    kind: "Education",
    title: "Master of Computer Applications (MCA)",
    detail: "In Progress",
    org: "Sikkim Manipal University — Online",
    place: "4 semesters, Fall 2026 intake",
    period: "2026 – 2028",
  },
  {
    kind: "Education",
    title: "Bachelor of Computer Applications (BCA)",
    detail: "CGPA 8.11",
    org: "International School of Management, Aryabhatta Knowledge University",
    place: "Patna, India",
    period: "2020 – 2023",
  },
  {
    kind: "Certification",
    title: "Certificate Course: Machine Learning & Data Science",
    detail: "",
    org: "IIT Guwahati",
    place: "",
    period: "Jan 2025 – Oct 2025",
  },
];

export const endpoints = [
  { label: "Email", value: identity.email, href: "mailto:" + identity.email, proto: "SMTP" },
  { label: "Phone", value: identity.phone, href: "tel:+919097148424", proto: "VOICE" },
  { label: "LinkedIn", value: "/in/adhrit-verma", href: LINKEDIN, proto: "HTTPS" },
  { label: "GitHub", value: "@Adhrit-Verma", href: GITHUB, proto: "HTTPS" },
];

export const chapters = [
  { id: "profile", index: "01", label: "Profile" },
  { id: "access", index: "02", label: "Access" },
  { id: "files", index: "03", label: "Files" },
  { id: "caselog", index: "04", label: "Case Log" },
  { id: "creds", index: "05", label: "Credentials" },
  { id: "connect", index: "06", label: "Connect" },
];
