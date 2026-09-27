/**
 * Every project on the site. Facts come from each repo's README at
 * github.com/Adhrit-Verma (read Sep 2026); where a resume line and a README
 * disagree, the README wins — it's what a reader can go and check.
 *
 * `flow` feeds both the dossier's written steps and the 3D pipeline formation
 * the camera travels (world/formations.ts), so the two can never disagree.
 */
import { GITHUB } from "./resume";

export type PixelIconName =
  | "lock"
  | "search"
  | "shield"
  | "mute"
  | "ask"
  | "check"
  | "loop"
  | "key"
  | "eye"
  | "layers"
  | "bolt"
  | "db"
  | "graph"
  | "grid"
  | "cam"
  | "gate"
  | "box";

export type Shot = { src: string; w: number; h: number; alt: string; caption: string };

export type Project = {
  slug: string;
  code: string;
  name: string;
  kind: string;
  year: string;
  status: string;
  tier: "featured" | "recovered";
  hook: string;
  problem: string;
  approach: string;
  perks: { icon: PixelIconName; title: string; text: string }[];
  tech: { name: string; role: string }[];
  /** `count` draws a pixel meter where one block is one unit — tests, phases. */
  metrics: { k: string; v: string; count?: number }[];
  flow: {
    nodes: { label: string; sub: string; hot?: boolean }[];
    /** a feedback edge, drawn back along the chain */
    loop?: { from: number; to: number; label: string };
    note: string;
  };
  bench?: {
    caption: string;
    legend: { a: string; b: string };
    rows: { k: string; a: number; b: number; unit: string; lowerIsBetter?: boolean }[];
  };
  shots: Shot[];
  /** a finished film with sound — click to play, never autoplays */
  film?: { src: string; poster: string; caption: string; duration: string };
  limits: string[];
  url: string;
};

const repo = (name: string) => `${GITHUB}/${name}`;

export const projects: Project[] = [
  {
    slug: "jimmy",
    code: "JMMY",
    name: "Jimmy",
    kind: "Always-on ambient assistant for Windows 11",
    year: "2026",
    status: "5 / 5 STAGES",
    tier: "featured",
    hook: "Remembers what you saw and heard, answers when you ask, and otherwise stays quiet.",
    problem:
      "You saw it, you heard it, and now you can't find it — the deadline on a tab you closed on Tuesday, the thing someone said on a call. Continuous capture is a commodity. The hard part is an assistant that knows when not to interrupt.",
    approach:
      "Screen text and nearby speech become one local, searchable history with a blurred screenshot for every moment. Say “Jimmy, …” out loud and the answer arrives beside the exact moments it came from. Built for six good interruptions an evening, not for throughput.",
    perks: [
      {
        icon: "lock",
        title: "Privacy by construction",
        text: "Faces are blurred before anything is written, and a test re-runs face detection on the saved JPEG and requires zero hits. There is no faces table — the absence is the design.",
      },
      {
        icon: "search",
        title: "Hybrid recall",
        text: "SQLite FTS5 keyword matches fused with local bge-m3 meaning search, so “consulting application” finds a page titled “McKinsey Forward”.",
      },
      {
        icon: "shield",
        title: "The model never writes a card",
        text: "It only answers yes/no questions. Code writes the card from words that exist in the evidence and real timestamps, so a card can't contain anything invented.",
      },
      {
        icon: "mute",
        title: "Knows when to shut up",
        text: "At most 4 cards an hour, never two within 10 minutes. Dismiss one and it stays quiet for 30. Silence is the default.",
      },
      {
        icon: "ask",
        title: "Asks back",
        text: "“What's this?” could mean the screen now or one from last week — so it asks, then waits for a spoken answer. No wake word needed for the reply.",
      },
    ],
    tech: [
      { name: "Python 3.12", role: "Capture loop, store, trigger gate" },
      { name: "DXGI + UI Automation", role: "Screen frames and on-screen text" },
      { name: "Whisper large-v3-turbo", role: "Local speech-to-text" },
      { name: "SQLite + FTS5", role: "History and keyword search" },
      { name: "bge-m3 (Ollama)", role: "Local meaning search" },
      { name: "qwen2.5:3b (Ollama)", role: "Yes/no card decisions" },
      { name: "NVIDIA Nemotron", role: "Optional spoken answers" },
      { name: "Electron + React", role: "Click-through overlay" },
    ],
    metrics: [
      { k: "Build stages shipped", v: "5/5", count: 5 },
      { k: "Assert-based checks", v: "59", count: 59 },
      { k: "Card ceiling", v: "4/hr" },
      { k: "Storage per hour", v: "25.8MB" },
    ],
    flow: {
      nodes: [
        { label: "Capture", sub: "DXGI frames · UI text · mic" },
        { label: "Blur", sub: "faces blurred, exclusions first", hot: true },
        { label: "Store", sub: "SQLite FTS5 · bge-m3 vectors" },
        { label: "Gate / route", sub: "rules, then qwen2.5:3b" },
        { label: "Overlay", sub: "answer beside its evidence", hot: true },
      ],
      note: "Capture never leaves the laptop — only the evidence shown with an answer does.",
    },
    shots: [
      {
        src: "/work/jimmy-answer.webp",
        w: 1600,
        h: 902,
        alt: "Jimmy answering the question 'what was that fellowship application I saw on Tuesday?': two evidence screenshots with timestamps on the left, a spoken answer panel on the right.",
        caption: "A spoken question, answered beside the two moments it came from",
      },
      {
        src: "/work/jimmy-timeline.webp",
        w: 1200,
        h: 814,
        alt: "Jimmy's timeline window: search results, a preview, and a minute-by-minute strip of blurred screenshots.",
        caption: "The timeline — a day as a strip of blurred moments",
      },
      {
        src: "/work/jimmy-askback.webp",
        w: 700,
        h: 384,
        alt: "Jimmy asking whether 'this' means what is on screen now or something seen earlier.",
        caption: "It asks when it isn't sure",
      },
    ],
    film: {
      src: "/work/video/jimmy-film.mp4",
      poster: "/work/video/jimmy-film.jpg",
      caption: "Launch film — the real overlay and the real model, run on an invented set of pages",
      duration: "1:06",
    },
    limits: [
      "The model reads text, not pixels — canvases, video and some apps' main panes aren't described yet.",
      "No retention policy yet. Everything stays on your own disk: about 6 GB a month at 8 hours a day with 640 px thumbnails.",
      "A face embedding is a biometric template under India's DPDP Act even if never persisted. The design shrinks that exposure substantially; it doesn't take it to zero.",
    ],
    url: repo("Jimmy"),
  },
  {
    slug: "contrast",
    code: "CNTR",
    name: "Contrast",
    kind: "AI-assisted accessibility auditing & remediation",
    year: "2026",
    status: "PRODUCTION",
    tier: "featured",
    hook: "Fixes the accessibility failures automated scanners can only shrug at — then re-tests every fix in a fresh browser before daring to call it fixed.",
    problem:
      "Scanners catch missing alt text but not useless alt text, and none of them write the fix. Human auditors spend their hours on the measurable half of the job instead of the judgment calls only they can make.",
    approach:
      "Crawl the site — including pages behind a login — measure everything a machine can prove, ask a model only about what machines are bad at, write remediation grounded in WCAG, then inject each fix into a fresh page and re-scan it. A capacity multiplier for auditors, not a replacement.",
    perks: [
      {
        icon: "eye",
        title: "Measured ≠ assessed",
        text: "Findings a machine measured and findings a model judged are shown differently everywhere. The report states its own limits on the page, not in a footnote.",
      },
      {
        icon: "loop",
        title: "Every fix is verified",
        text: "Injected into a fresh browser and re-scanned: resolved and no new violations. Up to three attempts, then it escalates to a human instead of guessing.",
      },
      {
        icon: "key",
        title: "Sign-ins are an interruption",
        text: "It detects a login wall mid-crawl, stops, and lets you sign in inside the panel. Credentials are never stored — only the session, encrypted with AES-256-GCM.",
      },
      {
        icon: "check",
        title: "Audits itself",
        text: "Zero axe violations across six views in both themes, and that is a build condition. Every feature is keyboard-operable.",
      },
      {
        icon: "layers",
        title: "An audit is a version",
        text: "Runs stack like commits. The change line between runs is measured by fingerprint, so “fixed” means gone — not renumbered.",
      },
    ],
    tech: [
      { name: "Node.js 22", role: "Runtime — no build step, no framework" },
      { name: "LangGraph", role: "Phase 7 orchestration, interrupt() for humans" },
      { name: "Puppeteer", role: "Robots-aware crawl, embedded browser" },
      { name: "axe-core + Lighthouse", role: "The measured findings" },
      { name: "Google Gemini API", role: "Judgment calls and remediation" },
      { name: "RAG over WCAG 2.2", role: "Grounds every proposed fix" },
      { name: "SQLite", role: "Graph checkpoints and run history" },
    ],
    metrics: [
      { k: "Pipeline phases", v: "7", count: 7 },
      { k: "Test suite", v: "72", count: 72 },
      { k: "Axe violations in its UI", v: "0" },
      { k: "Fix attempts before a human", v: "3", count: 3 },
    ],
    flow: {
      nodes: [
        { label: "Crawl", sub: "read-only, same-origin" },
        { label: "Scan", sub: "axe · a11y tree · keyboard" },
        { label: "Assess", sub: "the judgment calls" },
        { label: "Retrieve", sub: "RAG over WCAG + house rules" },
        { label: "Fix", sub: "HTML / ARIA / CSS", hot: true },
        { label: "Verify", sub: "fresh browser re-scan", hot: true },
      ],
      loop: { from: 5, to: 4, label: "regressed · < 3 tries" },
      note: "Puppeteer and axe are called directly — deterministic tools don't need an agent wrapper.",
    },
    shots: [
      {
        src: "/work/contrast-overview.webp",
        w: 1280,
        h: 820,
        alt: "Contrast audit overview: a run listing 75 findings across 3 pages, with a severity breakdown of 36 critical, 12 serious and 27 moderate, and a banner stating that automated testing detects roughly 30-40% of WCAG issues.",
        caption: "Run overview — measured findings separated from model judgments",
      },
      {
        src: "/work/contrast-findings.webp",
        w: 1280,
        h: 820,
        alt: "Contrast findings view, listing individual accessibility violations with their severity and location.",
        caption: "Findings, filterable by certainty and severity",
      },
      {
        src: "/work/contrast-composer.webp",
        w: 1280,
        h: 820,
        alt: "Contrast remediation composer in its light theme, showing a proposed code fix for an accessibility issue.",
        caption: "Remediation composer, light theme",
      },
    ],
    limits: [
      "Automated testing catches roughly 30–40% of WCAG issues. Nothing it produces is a conformance claim.",
      "A fix that couldn't be verified is labelled a suggestion, never a fix.",
      "Source-available rather than open source: viewing is open, using it isn't.",
    ],
    url: repo("Contrast"),
  },
  {
    slug: "clauseguard",
    code: "CLGD",
    name: "ClauseGuard",
    kind: "Multi-agent contract & policy review pipeline",
    year: "2026",
    status: "23 TESTS PASSING",
    tier: "featured",
    hook: "Upload a contract, get back a risk verdict — so a human reviewer starts from a report instead of a blank document.",
    problem:
      "Legal, procurement and compliance teams read long contracts by hand to spot auto-renewal traps, low liability caps and one-sided indemnity. It's slow, inconsistent between reviewers, and doesn't scale.",
    approach:
      "Three LangGraph agents automate the first pass: the Extractor segments the document into labeled clauses, the Risk Analyzer checks each against a configurable rule set, and the Summarizer writes a plain-English verdict.",
    perks: [
      {
        icon: "shield",
        title: "Validated hand-offs",
        text: "Every hand-off between agents is checked against a Pydantic schema, so a malformed step fails loudly instead of flowing downstream.",
      },
      {
        icon: "search",
        title: "Hybrid retrieval that degrades",
        text: "BM25 keyword search fused with local Ollama embeddings by reciprocal rank fusion — and keyword-only, automatically, when no embedding model is present.",
      },
      {
        icon: "bolt",
        title: "Two backends, chosen per run",
        text: "Local Ollama for free offline runs, the Anthropic API for higher-quality paid ones. One LLM seam, so tests mock exactly one thing.",
      },
      {
        icon: "check",
        title: "Evals, not vibes",
        text: "An eval harness scores the model on labeled documents — recall, precision, latency, tokens and cost per case — separate from the 23 offline unit tests.",
      },
    ],
    tech: [
      { name: "Python", role: "Pipeline and rules" },
      { name: "LangGraph", role: "Three-agent state graph" },
      { name: "FastAPI", role: "POST /review, history, web UI" },
      { name: "Pydantic", role: "Schema on every hand-off" },
      { name: "Ollama", role: "qwen2.5:7b + nomic-embed-text, local" },
      { name: "Anthropic API", role: "Paid, higher-quality backend" },
      { name: "SQLite", role: "Review audit history" },
      { name: "pytest", role: "23 tests, every LLM call mocked" },
    ],
    metrics: [
      { k: "Specialised agents", v: "3", count: 3 },
      { k: "Test suite", v: "23", count: 23 },
      { k: "LLM backends", v: "2", count: 2 },
    ],
    flow: {
      nodes: [
        { label: "Upload", sub: "PDF or text" },
        { label: "Extractor", sub: "labeled clauses" },
        { label: "Risk Analyzer", sub: "rules × BM25 + embeddings", hot: true },
        { label: "Summarizer", sub: "plain-English summary" },
        { label: "Verdict", sub: "e.g. HIGH_RISK", hot: true },
      ],
      note: "Every arrow here is a Pydantic-validated hand-off.",
    },
    shots: [],
    limits: [
      "No retry yet when the model returns malformed JSON.",
      "No OCR — scanned PDFs aren't readable.",
      "No human-review queue for low-confidence extractions.",
    ],
    url: repo("ClauseGuard"),
  },
  {
    slug: "tablefox",
    code: "TBFX",
    name: "TableFox",
    kind: "PostgreSQL schema intelligence for AI agents (MCP server)",
    year: "2026",
    status: "14 / 14 ANSWERS MATCH",
    tier: "featured",
    hook: "An agent pointed at a database doesn't know the schema. Pasting the whole dump into every prompt is the usual fix — this is the better one.",
    problem:
      "A schema dump in the prompt grows with the database, costs tokens on every turn, and still produces hallucinated table names.",
    approach:
      "Map the database into a searchable graph of tables, columns and relationships. The agent retrieves the few relations a question needs, drafts bounded SQL, and runs it through a read-only guard. Two MCP calls per task, one connection checkout.",
    perks: [
      {
        icon: "graph",
        title: "Bounded context",
        text: "BM25F ranks relations over schema text, declared foreign-key joins are added, and the result is packed into a byte-bounded context — not the whole dump.",
      },
      {
        icon: "gate",
        title: "Guarded execution",
        text: "Every batch runs in one pooled, read-only transaction: EXPLAIN plan and cost-ceiling policy first, then execute, on a minimal-privilege role.",
      },
      {
        icon: "db",
        title: "Never indexes your rows",
        text: "Only schema is indexed. Nothing about application rows is ever stored or cached.",
      },
      {
        icon: "check",
        title: "Honest benchmark",
        text: "42 executions over a reviewed 14-task corpus against a live database, with the cases where it loses printed next to the ones where it wins.",
      },
    ],
    tech: [
      { name: "Python 3.11", role: "Server and retrieval" },
      { name: "MCP", role: "database_task_context · database_readonly_batch" },
      { name: "PostgreSQL", role: "Read-only, connection-pooled role" },
      { name: "BM25F", role: "Ranks relations over schema text" },
      { name: "FastAPI", role: "Backend for the UI" },
      { name: "Next.js", role: "Schema explorer UI" },
      { name: "pytest", role: "67 tests" },
    ],
    metrics: [
      { k: "Tokens per task", v: "−29%" },
      { k: "Warm median", v: "1,200ms" },
      { k: "Answers matching SQL", v: "14/14", count: 14 },
      { k: "pytest tests", v: "67", count: 67 },
    ],
    flow: {
      nodes: [
        { label: "Question", sub: "from the agent" },
        { label: "Rank", sub: "BM25F over schema text", hot: true },
        { label: "Join", sub: "declared FK edges" },
        { label: "Pack", sub: "byte-bounded context" },
        { label: "Guard", sub: "EXPLAIN · policy · read-only", hot: true },
        { label: "Rows", sub: "compact columnar" },
      ],
      note: "Two MCP calls per task. One database connection checkout.",
    },
    bench: {
      caption:
        "Live PostgreSQL, 38 tables, 14 tasks × 3 repeats. Tokens (with the optional context window at 16) varied under 1%; latency moved ±100 ms between runs, so treat it as approximate.",
      legend: { a: "TableFox", b: "Catalog search + direct SQL" },
      rows: [
        { k: "Warm median latency", a: 1200, b: 2396, unit: "ms", lowerIsBetter: true },
        { k: "Mean tokens per task", a: 879, b: 1240, unit: "", lowerIsBetter: true },
      ],
    },
    shots: [],
    limits: [
      "Cold start is slower: the first task in a new process lands around 2,683 ms against 2,396 ms. It only pulls ahead from the second task on.",
      "Retrieval is lexical, so meaning that lives only in row values is invisible — that single miss is the 13/14 retrieval score.",
      "Simple single-table lookups gain the least.",
    ],
    url: repo("TableFox"),
  },
  {
    slug: "gdc",
    code: "GDC",
    name: "Gradient Dense Code",
    kind: "A QR code whose modules hold levels, not bits",
    year: "2025–26",
    status: "FORMAT v11",
    tier: "recovered",
    hook: "Standard QR geometry, but every data module is printed at one of 4, 8 or 16 gray levels — 2 to 3× the data in the same area.",
    problem:
      "A QR module stores exactly one bit: black or white. The largest QR code tops out at 2,953 bytes, however good the printer and camera are.",
    approach:
      "Keep everything that makes QR frameable — finders, timing lines, alignment and format areas, quiet zone — and let each data module carry 2–4 bits as calibrated gray (or RGB) levels, with a decoder built to survive real cameras.",
    perks: [
      {
        icon: "grid",
        title: "2–4 bits per module",
        text: "4, 8 or 16 levels per module; zlib is applied automatically when the payload compresses.",
      },
      {
        icon: "key",
        title: "Self-describing",
        text: "The profile — levels, gray or RGB, ECC — is BCH-coded into QR's own format modules, so the decoder needs no settings.",
      },
      {
        icon: "cam",
        title: "Built for real cameras",
        text: "Homography plus a moving-least-squares residual field for lens and paper curl, lighting correction from known modules, per-channel k-means, and decision-feedback deblurring.",
      },
      {
        icon: "eye",
        title: "Still frames like QR",
        text: "OpenCV's standard QR detector locates the symbol — a test checks it.",
      },
    ],
    tech: [
      { name: "Python 3.12", role: "Encoder, decoder, CLI" },
      { name: "Reed-Solomon", role: "QR-matched L/M/Q/H parity" },
      { name: "BCH + CRC-16", role: "Profile and payload integrity" },
      { name: "OpenCV", role: "Finder detection, webcam scan" },
      { name: "k-means (1-D)", role: "Level clustering per channel" },
      { name: "zlib", role: "Automatic compression" },
    ],
    metrics: [
      { k: "Bits per module", v: "2–4" },
      { k: "40-L capacity, 8 gray", v: "8,883B" },
      { k: "Format revisions", v: "11", count: 11 },
      { k: "Tests", v: "7", count: 7 },
    ],
    flow: {
      nodes: [
        { label: "Payload", sub: "zlib if smaller" },
        { label: "Header", sub: "format · length · CRC-16" },
        { label: "Reed-Solomon", sub: "QR L/M/Q/H shares", hot: true },
        { label: "Interleave", sub: "then whitening" },
        { label: "Levels", sub: "Gray-coded, 4 / 8 / 16", hot: true },
        { label: "Place", sub: "QR's zigzag order" },
      ],
      note: "Decoding runs it backwards through lighting correction, k-means and deblur.",
    },
    bench: {
      caption: "Incompressible bytes at error-correction level M, same symbol version. From the repo's capacity table.",
      legend: { a: "GDC · 4 gray", b: "Standard QR" },
      rows: [
        { k: "Version 10 (57×57)", a: 421, b: 213, unit: "B" },
        { k: "Version 40 (177×177)", a: 4585, b: 2331, unit: "B" },
      ],
    },
    shots: [
      {
        src: "/work/gdc-vs-qr.webp",
        w: 1540,
        h: 450,
        alt: "A standard QR code beside a same-size Gradient Dense Code whose modules are drawn in several gray levels.",
        caption: "Same size, same geometry — modules hold levels",
      },
      {
        src: "/work/gdc-camera.webp",
        w: 1160,
        h: 450,
        alt: "A simulated camera capture of a GDC symbol with perspective, blur and a warm cast, next to the recovered module grid.",
        caption: "Recovery from a simulated phone capture",
      },
    ],
    limits: [
      "Only the GDC decoder reads the payload. Phone QR apps recognise the shape but not the levels.",
      "Robustness numbers come from simulation; real printer and phone validation is the next step.",
      "16 levels and RGB need sharp, high-resolution captures — JPEG chroma subsampling hurts RGB in particular.",
    ],
    url: repo("GDC"),
  },
  {
    slug: "tasx",
    code: "TASX",
    name: "Self-Extending Agents",
    kind: "Two-agent system that grows reviewable skills",
    year: "2026",
    status: "REFERENCE BUILD",
    tier: "recovered",
    hook: "A User Agent answers requests; a Builder Agent writes a new skill when none exists — sandboxed and approved before it can ever be invoked.",
    problem:
      "An agent that can write its own tools is only safe if new capability can't run the moment it's generated.",
    approach:
      "Split the roles. The User Agent only invokes skills from an approved registry. When one is missing, the Builder Agent produces an isolated skill package that must pass sandbox checks and an explicit approval before it can be called.",
    perks: [
      {
        icon: "gate",
        title: "Approval gate",
        text: "Nothing generated is invocable until it has been tested in the sandbox and explicitly approved.",
      },
      {
        icon: "box",
        title: "Isolated packages",
        text: "Each new capability is a reviewable package, inspectable over the API before anyone approves it.",
      },
      {
        icon: "check",
        title: "Standard-library core",
        text: "The core logic uses only Python's standard library, so it's testable without installing anything.",
      },
    ],
    tech: [
      { name: "Python", role: "Agents, registry, sandbox — stdlib only" },
      { name: "FastAPI", role: "Chat, builder and skill endpoints" },
      { name: "unittest", role: "Test discovery, no dependencies" },
    ],
    metrics: [
      { k: "Agents", v: "2", count: 2 },
      { k: "API endpoints", v: "6", count: 6 },
    ],
    flow: {
      nodes: [
        { label: "Request", sub: "POST /chat" },
        { label: "User Agent", sub: "checks the registry" },
        { label: "Builder Agent", sub: "writes a skill package", hot: true },
        { label: "Sandbox", sub: "POST /skills/{id}/test" },
        { label: "Approve", sub: "explicit, by a human", hot: true },
        { label: "Invoke", sub: "only approved skills" },
      ],
      note: "If a skill already exists and is approved, the request goes straight to Invoke.",
    },
    shots: [],
    limits: [],
    url: repo("two-agent-self-extending-ai-system"),
  },
];

export const featured = projects.filter((p) => p.tier === "featured");
export const recovered = projects.filter((p) => p.tier === "recovered");
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
