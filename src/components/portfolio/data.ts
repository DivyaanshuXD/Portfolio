/**
 * Portfolio content — trimmed for confidence.
 * Show, don't tell.
 */

export const PROFILE = {
  name: "Divyaanshu Tonk",
  firstName: "Divyaanshu",
  lastName: "Tonk",
  role: "Software Engineer",
  location: "Hyderabad, IN",
  phone: "+91 70329 23464",
  email: "divyaanshutonk@gmail.com",
  github: "https://github.com/DivyaanshuXD",
  githubHandle: "DivyaanshuXD",
  linkedin: "https://linkedin.com/in/divyaanshutonk",
  linkedinHandle: "divyaanshutonk",
  intro: "Building production-grade software — distributed systems, LLM tooling, ML applications.",
  bio: "CS undergraduate engineering systems that ship to production. Three award-winning builds across LLM observability, ML-driven platforms, and embedded IoT. Currently exploring where AI agents, observability, and developer tooling converge.",
  status: "Available for internships & collaborations",
};

export const STATS = [
  { value: 3, suffix: "", label: "Awards", sub: "1st · 3rd · Finalist" },
  { value: 860, suffix: "+", label: "Teams out-built", sub: "IGNITE 2026" },
  { value: 50, suffix: "+", label: "LLM models traced", sub: "LLMTap" },
  { value: 95.25, suffix: "%", label: "ML accuracy", sub: "Raksetu" },
];

export type SkillCategory = {
  id: string;
  label: string;
  index: string;
  skills: { name: string; weight: number }[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    label: "Languages",
    index: "01",
    skills: [
      { name: "TypeScript", weight: 0.95 },
      { name: "Python", weight: 0.9 },
      { name: "JavaScript", weight: 0.95 },
      { name: "Java", weight: 0.78 },
      { name: "SQL", weight: 0.85 },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    index: "02",
    skills: [
      { name: "React", weight: 0.95 },
      { name: "Vite", weight: 0.88 },
      { name: "HTML5", weight: 0.92 },
      { name: "CSS3", weight: 0.9 },
      { name: "PWA", weight: 0.85 },
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    index: "03",
    skills: [
      { name: "Node.js", weight: 0.93 },
      { name: "Express.js", weight: 0.9 },
      { name: "Fastify", weight: 0.9 },
      { name: "REST APIs", weight: 0.93 },
      { name: "Server-Sent Events", weight: 0.88 },
      { name: "Monorepo", weight: 0.85 },
    ],
  },
  {
    id: "data",
    label: "Databases & Cloud",
    index: "04",
    skills: [
      { name: "MongoDB", weight: 0.88 },
      { name: "MySQL", weight: 0.82 },
      { name: "SQLite", weight: 0.85 },
      { name: "Firebase", weight: 0.92 },
    ],
  },
  {
    id: "ai",
    label: "AI & ML",
    index: "05",
    skills: [
      { name: "LLM Integration", weight: 0.92 },
      { name: "OpenAI", weight: 0.9 },
      { name: "Anthropic", weight: 0.88 },
      { name: "Groq", weight: 0.85 },
      { name: "RAG Systems", weight: 0.88 },
      { name: "ML Modeling", weight: 0.82 },
      { name: "Prompt Engineering", weight: 0.92 },
    ],
  },
  {
    id: "devops",
    label: "DevOps & Tools",
    index: "06",
    skills: [
      { name: "Git & GitHub", weight: 0.95 },
      { name: "Automated Testing", weight: 0.8 },
      { name: "CLI Tooling (npx)", weight: 0.88 },
      { name: "VS Code", weight: 0.95 },
    ],
  },
  {
    id: "cs",
    label: "CS Fundamentals",
    index: "07",
    skills: [
      { name: "DSA", weight: 0.9 },
      { name: "OOP", weight: 0.9 },
      { name: "DBMS", weight: 0.88 },
      { name: "System Design", weight: 0.85 },
      { name: "Complexity Analysis", weight: 0.88 },
    ],
  },
];

export type Project = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  highlights: string[];
  metrics?: { label: string; value: string }[];
  link?: string;
  repo?: string;
  accent: string;
  year: string;
  status: "shipped" | "live" | "research";
  category: string;
};

export const PROJECTS: Project[] = [
  {
    id: "llmtap",
    index: "01",
    name: "LLMTap",
    tagline: "Local-First LLM Observability",
    category: "Developer Tooling",
    description: "Zero-config observability for LLM apps. Real-time tracing, cost tracking, latency monitoring — 2-line SDK integration.",
    stack: ["TypeScript", "React", "Fastify", "SQLite", "SSE", "Monorepo"],
    highlights: [
      "ES Proxy SDK transparently intercepts all LLM calls — OpenAI, Anthropic, Gemini, Groq, DeepSeek, Ollama. Zero code changes.",
      "TypeScript monorepo with Fastify + SQLite backend, SSE live trace streaming, React + Vite dashboard.",
      "Ships as `npx llmtap` — OTLP export for Datadog, Grafana, Jaeger. Free, private by default.",
    ],
    metrics: [
      { label: "Providers", value: "10+" },
      { label: "Models", value: "50+" },
      { label: "Integration", value: "2 lines" },
    ],
    link: "https://llmtap.vercel.app",
    repo: "https://github.com/DivyaanshuXD",
    accent: "#a8421e",
    year: "2025",
    status: "shipped",
  },
  {
    id: "raksetu",
    index: "02",
    name: "Raksetu",
    tagline: "Smart Blood Donation Network",
    category: "Social Impact · PWA",
    description: "Nationwide real-time blood donation platform. Live sync, ML donor retention, emergency broadcast pipelines.",
    stack: ["React", "Node.js", "Firebase", "Twilio", "ML", "PWA", "Maps API"],
    highlights: [
      "Firebase-backed platform serving concurrent users across India with live data sync.",
      "ML donor retention model at 95.25% accuracy triggers automated re-engagement pipelines.",
      "Twilio SMS + push alerts broadcast emergency requests to nearby donors in real time.",
    ],
    metrics: [
      { label: "ML accuracy", value: "95.25%" },
      { label: "Deployment", value: "Nationwide" },
      { label: "Sync", value: "Real-time" },
    ],
    link: "https://raksetu.vercel.app/",
    accent: "#34503a",
    year: "2024",
    status: "live",
  },
  {
    id: "childsafe",
    index: "03",
    name: "Child Safe O2",
    tagline: "Vehicle Child Safety System",
    category: "Embedded · IoT",
    description: "Embedded IoT system detecting unattended children in vehicles. Automated ventilation + emergency alerts, fail-safe by design.",
    stack: ["Embedded Systems", "GSM", "Relay Control", "IoT", "PIR Sensors"],
    highlights: [
      "PIR sensor detection + GSM module automates SMS and voice call alerts on trigger.",
      "Relay-based ventilation circuit operates independently of vehicle ignition — fail-safe.",
      "Validated across multi-scenario heat and motion conditions with structured testing.",
    ],
    metrics: [
      { label: "Detection", value: "PIR + motion" },
      { label: "Alerting", value: "SMS + voice" },
      { label: "Fail-safe", value: "Ignition-independent" },
    ],
    repo: "https://github.com/DivyaanshuXD/ChildSafe-O2",
    accent: "#b8862a",
    year: "2024",
    status: "shipped",
  },
];

export type Award = {
  id: string;
  date: string;
  year: string;
  title: string;
  context: string;
  result: string;
  resultLabel: string;
  accent: string;
  /** ISO month (e.g. "2026-02") for timeline sorting */
  dateIso?: string;
  /** Short detail sentence for the timeline card */
  summary?: string;
};

export const AWARDS: Award[] = [
  {
    id: "ignite-2026",
    date: "Feb 2026",
    year: "2026",
    title: "IGNITE — National Project Expo",
    context: "860+ teams nationwide",
    result: "1st",
    resultLabel: "Winner",
    accent: "#a8421e",
    dateIso: "2026-02",
    summary:
      "1st place out of 860+ teams nationwide. Child Safe O2 — the embedded IoT vehicle safety system — was judged on technical depth, real-world impact, and fail-safe engineering.",
  },
  {
    id: "social-impact-2025",
    date: "Aug 2025",
    year: "2025",
    title: "Social Impact Award",
    context: "464 teams · global",
    result: "Top 24",
    resultLabel: "Finalist",
    accent: "#34503a",
    dateIso: "2025-08",
    summary:
      "Top 24 finalist out of 464 global teams. Raksetu was recognized for measurable social impact through its nationwide real-time blood donation network.",
  },
  {
    id: "hackacure-2025",
    date: "Oct 2025",
    year: "2025",
    title: "Hack-A-Cure · VIT Chennai",
    context: "Medical AI hackathon",
    result: "3rd",
    resultLabel: "Winner",
    accent: "#b8862a",
    dateIso: "2025-10",
    summary:
      "3rd place at Hack-A-Cure medical AI hackathon. Shipped a working ML pipeline for clinical triage within the 24-hour build window.",
  },
];

export type Certification = {
  id: string;
  issuer: string;
  title: string;
  badge: string;
  validUntil?: string;
  year: string;
  /** ISO month (e.g. "2025-07") for timeline sorting — optional */
  date?: string;
  /** Optional end date (for internships / multi-month programs) — format like "Jul 2026" */
  dateEnd?: string;
  /** ISO end date for sorting internships */
  dateEndIso?: string;
  /** Short detail sentence for the timeline card */
  summary?: string;
  /** Type — "cert" (one-day cert) or "internship" (multi-month program) */
  kind?: "cert" | "internship";
};

export const CERTIFICATIONS: Certification[] = [
  {
    id: "gcp-genai-leader",
    issuer: "Google Cloud",
    title: "Generative AI Leader",
    badge: "GCP",
    validUntil: "Jul 2029",
    year: "2026",
    date: "2026-07",
    summary:
      "Validated GenAI leadership — model selection, prompt design, RAG pipelines, Vertex AI productionization. Verified cloud-native AI know-how. Earned Jul 30, 2026.",
    kind: "cert",
  },
  {
    id: "gcp-virtual-internship",
    issuer: "L4G × Google",
    title: "Cloud Virtual Internship",
    badge: "L4G",
    year: "2026",
    date: "2026-05",
    dateEnd: "Jul 2026",
    dateEndIso: "2026-07",
    summary:
      "Hands-on GCP internship from May 2026 → Jul 2026 — Compute Engine, Cloud Run, IAM, BigQuery, Vertex AI. Built and deployed end-to-end cloud projects across multiple tracks.",
    kind: "internship",
  },
  {
    id: "accenture-gold",
    issuer: "Accenture",
    title: "Go for Gold — Gold Level",
    badge: "ACN",
    year: "2025",
    date: "2025-11",
    summary:
      "Accenture's career-readiness gold tier — completed November 2025. Communication, problem-solving, agile delivery, ethics, and consulting fundamentals.",
    kind: "cert",
  },
];

export type Education = {
  id: string;
  institution: string;
  degree: string;
  period: string;
};

export const EDUCATION: Education[] = [
  {
    id: "cmr",
    institution: "CMR College of Engineering & Technology",
    degree: "B.Tech — Computer Science",
    period: "2023 — 2027",
  },
  {
    id: "sri-chaitanya",
    institution: "Sri Chaitanya Junior Kalasala",
    degree: "Intermediate — MPC",
    period: "2023",
  },
];

export const NAV_ITEMS = [
  { id: "hero", label: "Index", index: "00" },
  { id: "about", label: "About", index: "01" },
  { id: "work", label: "Work", index: "02" },
  { id: "capabilities", label: "Stack", index: "03" },
  { id: "recognition", label: "Awards", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
];

export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/DivyaanshuXD", handle: "@DivyaanshuXD" },
  { label: "LinkedIn", href: "https://linkedin.com/in/divyaanshutonk", handle: "/in/divyaanshutonk" },
  { label: "Email", href: "mailto:divyaanshutonk@gmail.com", handle: "divyaanshutonk@gmail.com" },
  { label: "Phone", href: "tel:+917032923464", handle: "+91 70329 23464" },
];

export const MARQUEE_WORDS = [
  "LLM Observability",
  "Distributed Systems",
  "TypeScript",
  "React",
  "Fastify",
  "RAG",
  "Firebase",
  "Monorepo",
  "SSE",
  "ML Pipelines",
  "System Design",
  "PWA",
  "Node.js",
  "Prompt Engineering",
];
