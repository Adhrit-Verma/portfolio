/**
 * Single source of truth for every word on this site.
 *
 * Copy is drawn from two JD-targeted resumes (AI Software Engineer / Forward
 * Deployed Engineer) and cross-checked against the live public repos at
 * github.com/Adhrit-Verma. Where a repo and a resume disagree, the repo wins —
 * it is the artifact a reader can actually go and verify.
 *
 * Projects live in projects.ts.
 *
 * Known divergence: Contrast's suite is 72 tests in the repo; both resume PDFs
 * still say 68. This file uses 72.
 */
export const LINKEDIN = "https://www.linkedin.com/in/adhrit-verma/";
export const GITHUB = "https://github.com/Adhrit-Verma";

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

/** The record page's chapters — the rail in Nav.tsx jumps between these. */
export const chapters = [
  { id: "profile", index: "01", label: "Profile" },
  { id: "access", index: "02", label: "Toolkit" },
  { id: "caselog", index: "03", label: "Case Log" },
  { id: "creds", index: "04", label: "Credentials" },
];
