/**
 * Single source of truth for every word on this site.
 * Copy is lifted verbatim from Adhrit_Verma_Optimized_2.pdf.
 */
export const LINKEDIN = "https://www.linkedin.com/in/adhrit-verma/";
export const GITHUB = "https://github.com/Adhrit-Verma";

export const identity = {
  name: "Adhrit Verma",
  handle: "ADHRIT_VERMA",
  role: "Backend / Full-Stack Software Engineer",
  stack: ["Node.js", "PostgreSQL", "Redis"],
  location: "Bengaluru, India",
  email: "adhrit007@gmail.com",
  phone: "+91 90971 48424",
  status: "EMPLOYED — NEWRU TECHNOLOGIES",
  since: "SEP 2023",
};

/** ctOS-profiler stat readout. Every number traces back to a resume line. */
export const stats = [
  { label: "Years in production", value: 3, prefix: "", suffix: "", note: "Since Sep 2023" },
  { label: "Aviatrack core workflows", value: 90, prefix: "", suffix: "%+", note: "Delivered end-to-end" },
  { label: "Flight-planning effort cut", value: 50, prefix: "40–", suffix: "%", note: "Multi-leg automation" },
  { label: "Compliance review errors", value: 30, prefix: "−", suffix: "%+", note: "5 DGCA-style checks" },
];

export const summary =
  "Backend-focused Software Engineer with 3 years of experience designing and owning production systems using Node.js, Express.js, PostgreSQL, MongoDB, and Redis. Built end-to-end workflows for airline operations and HR platforms, cutting recurring flight-planning effort by 40–50% and lowering compliance-review errors by more than 30%. Proficient in Python, FastAPI, React, AWS, Docker, and retrieval-augmented generation (RAG). Known for production problem-solving, system ownership, and shipping business-critical features from requirements through deployment.";

export const profileTraits = [
  { k: "Discipline", v: "Backend-first" },
  { k: "Domain", v: "Airline ops · HR platforms" },
  { k: "Current focus", v: "RAG · agentic AI" },
  { k: "Mode of operation", v: "Owns systems end-to-end" },
];

export const skillModules = [
  {
    id: "LANG",
    title: "Languages",
    items: ["JavaScript", "Python", "SQL"],
  },
  {
    id: "BACK",
    title: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "Authentication & Authorization",
      "RBAC",
    ],
  },
  {
    id: "DATA",
    title: "Data Stores",
    items: [
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Schema design",
      "Indexing",
      "Query optimization",
      "Data integrity",
    ],
  },
  {
    id: "FRNT",
    title: "Frontend",
    items: ["React.js", "HTML5", "CSS3"],
  },
  {
    id: "INFRA",
    title: "Cloud & Delivery",
    items: ["Docker", "GitLab CI/CD", "AWS Lambda", "S3", "DynamoDB", "Linux VPS", "Git"],
  },
  {
    id: "GENAI",
    title: "GenAI & Data",
    items: [
      "RAG",
      "LangChain",
      "LangGraph",
      "Prompt engineering",
      "AI agents",
      "Pandas",
      "NumPy",
    ],
  },
];

export const experience = [
  {
    org: "Newru Technologies Pvt. Ltd.",
    role: "Software Engineer",
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
          "Delivered more than 90% of Aviatrack's core operational workflows — flight planning, crew assignment, PIC/SIC allocation, duty-time calculations, document expiry tracking, and reporting.",
          "Cut recurring flight-planning effort by 40–50% by automating multi-leg crew scheduling, validation rules, and exception handling.",
          "Enforced five DGCA-style compliance checks (flight duty period, flight time, weekly rest, crew qualifications, document validity), lowering manual review errors by more than 30%.",
          "Designed Node.js and Express.js services with PostgreSQL data models and Redis-backed processing to improve workflow reliability and validation.",
          "Built Python and Node.js automation utilities for data processing, removing repetitive steps across engineering and business teams.",
        ],
      },
      {
        code: "HRMW",
        name: "HRM Web Application",
        subtitle: "HR & Employee Management System",
        log: [
          "Directed backend and full-stack delivery of two role-specific portals (HR, Employee) covering records, attendance, leave, compensation, payroll documents, onboarding, training, and device tracking.",
          "Reengineered PostgreSQL schemas, indexes, and queries to accelerate response times and eliminate recurring data-integrity defects.",
          "Cut manual follow-up across 5 recurring HR workflows by automating approvals, email notifications, document verification, attendance, and leave tracking.",
          "Strengthened security via RBAC, audit logging, secure session handling, and 2FA-ready flows — improving access control and traceability.",
          "Standardized deployments through GitLab CI/CD pipelines, shortening release prep and accelerating onboarding for new engineers.",
        ],
      },
    ],
  },
];

/** Fully-recovered dossiers — every line sourced from the resume. */
export const files = [
  {
    id: "F-01",
    code: "AVTK",
    name: "Aviatrack",
    kind: "Airline Crew & Operations Management Platform",
    hook: "Runs the day an airline actually has — planning, crew, duty time, compliance.",
    stack: ["Node.js", "Express.js", "PostgreSQL", "Redis", "Python"],
    body: [
      "Delivered more than 90% of core operational workflows: flight planning, crew assignment, PIC/SIC allocation, duty-time calculations, document expiry tracking, and reporting.",
      "Automated multi-leg crew scheduling, validation rules, and exception handling — cutting recurring flight-planning effort by 40–50%.",
      "Enforced five DGCA-style compliance checks (flight duty period, flight time, weekly rest, crew qualifications, document validity), lowering manual review errors by more than 30%.",
    ],
    metrics: [
      { k: "Core workflows", v: "90%+" },
      { k: "Planning effort", v: "−40–50%" },
      { k: "Compliance checks", v: "5" },
    ],
  },
  {
    id: "F-02",
    code: "HRMW",
    name: "HRM Web Application",
    kind: "HR & Employee Management System",
    hook: "Two portals, one schema, and far fewer people chasing approvals over email.",
    stack: ["Node.js", "PostgreSQL", "React.js", "GitLab CI/CD", "RBAC"],
    body: [
      "Directed backend and full-stack delivery of two role-specific portals (HR, Employee) covering records, attendance, leave, compensation, payroll documents, onboarding, training, and device tracking.",
      "Reengineered PostgreSQL schemas, indexes, and queries to accelerate response times and eliminate recurring data-integrity defects.",
      "Strengthened security via RBAC, audit logging, secure session handling, and 2FA-ready flows — improving access control and traceability.",
    ],
    metrics: [
      { k: "Portals shipped", v: "2" },
      { k: "Workflows automated", v: "5" },
      { k: "Deploys", v: "CI/CD" },
    ],
  },
  {
    id: "F-03",
    code: "CNTR",
    name: "Contrast",
    kind: "AI-Assisted Accessibility Auditing & Remediation Platform",
    hook: "Fixes the accessibility failures automated scanners can only shrug at — then re-scans to prove it.",
    stack: ["Node.js", "Puppeteer", "LangGraph", "Google Gemini API", "axe-core", "SQLite"],
    body: [
      "Shipped an end-to-end AI-assisted auditing and remediation pipeline — 7 phases, LangGraph-orchestrated over Puppeteer, axe-core/Lighthouse, and Gemini-based judgment calls — validated by a 68-test suite and zero axe violations in its own UI.",
      "Automated fixes for issues tools alone can't judge — alt-text quality, heading semantics, link text, reading order — grounding every AI-generated remediation in a RAG pipeline over WCAG 2.2 criteria and house patterns, then re-verifying via fresh-browser re-scans.",
      "Extended audits to authenticated, login-gated apps with zero credentials stored: sign-in walls are detected mid-crawl and only the resulting session is persisted, encrypted at rest (AES-256-GCM).",
    ],
    metrics: [
      { k: "Pipeline phases", v: "7" },
      { k: "Test suite", v: "68" },
      { k: "Axe violations", v: "0" },
    ],
  },
];

/**
 * Partially-recovered archive: names and one-line framing only.
 * Deliberately thin — the source resume carries no detail for these.
 * Promote one into `files` above once real copy exists for it.
 */
export const archive = [
  { code: "ASST", name: "Personal AI Assistant", hook: "Agentic assistant built around day-to-day workflow." },
  { code: "PGIQ", name: "Postgres Schema Intelligence", hook: "Local-first schema context tool for AI agents." },
  { code: "DENS", name: "Dense Visual Encoding", hook: "Experiment in high-density visual data encoding." },
  { code: "BCST", name: "Intranet Audio Broadcast", hook: "Local-network audio broadcasting platform." },
  { code: "RAGQ", name: "RAG Document Q&A", hook: "Retrieval-augmented question answering over documents." },
];

export const credentials = [
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
  { id: "caselog", index: "03", label: "Case Log" },
  { id: "files", index: "04", label: "Files" },
  { id: "creds", index: "05", label: "Credentials" },
  { id: "connect", index: "06", label: "Connect" },
];
