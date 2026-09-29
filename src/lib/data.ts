/**
 * Single source of truth for every fact on the site.
 *
 * This module is intentionally free of React and icon imports so it can be
 * shipped to the client (terminal, OS, 3D labels) without dragging icon
 * libraries into the bundle. Icons are resolved server-side in `icons.ts`.
 */

export const siteConfig = {
  name: "Osman Bilgin",
  firstName: "Osman",
  lastName: "Bilgin",
  initials: "OB",
  handle: "osman@bilgin",
  titles: [
    "FULL STACK DEVELOPER",
    "SOFTWARE ENGINEER",
    "AI SYSTEM ARCHITECT",
    "WEB APPLICATION SPECIALIST",
  ],
  tagline: ["BUILDING DIGITAL EXPERIENCES", "WITHOUT LIMITS"],
  description:
    "Professional Full Stack Developer specializing in Web Development, AI Systems, SaaS Platforms, Enterprise Software, Mobile Applications and Cloud Solutions.",
  url: "https://osmanbilgin.dev",
  email: "osman_002001@hotmail.com",
  phone: "05325447381",
  phoneHref: "tel:+905325447381",
  phoneDisplay: "+90 532 544 73 81",
  instagram: "@0smanbilgin",
  instagramUrl: "https://instagram.com/0smanbilgin",
  availability: "Available for new projects",
  keywords: [
    "Full Stack Developer",
    "Software Engineer",
    "Web Developer",
    "PHP Developer",
    "Laravel Developer",
    "React Developer",
    "Next.js Developer",
    "Node.js Developer",
    "AI Developer",
    "SaaS Developer",
    "Mobile Developer",
    "Software Architect",
  ],
};

export const navLinks = [
  { label: "Desk", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const aboutHighlights = [
  {
    icon: "code",
    title: "Enterprise-Grade Code",
    description:
      "Clean architecture, scalable systems and maintainable code that's built to grow with your business.",
  },
  {
    icon: "brain",
    title: "AI-Powered Systems",
    description:
      "From LLM integrations to intelligent automation, I bring next-generation AI into real products.",
  },
  {
    icon: "layers",
    title: "Full Spectrum Stack",
    description:
      "Web, mobile, backend, databases, DevOps and cloud — one engineer who ships the entire pipeline.",
  },
  {
    icon: "rocket",
    title: "Performance Obsessed",
    description:
      "Lighthouse-perfect, SEO-ready and production-hardened experiences deployed on modern infrastructure.",
  },
] as const;

export interface TechItem {
  name: string;
  /** key into icons.ts */
  icon: string;
  color: string;
}

export interface TechCategory {
  id: string;
  label: string;
  description: string;
  items: TechItem[];
}

export const languages: TechItem[] = [
  { name: "PHP", icon: "php", color: "#8993BE" },
  { name: "JavaScript", icon: "javascript", color: "#F7DF1E" },
  { name: "TypeScript", icon: "typescript", color: "#3178C6" },
  { name: "Python", icon: "python", color: "#3776AB" },
  { name: "Java", icon: "java", color: "#EA2D2E" },
  { name: "C#", icon: "csharp", color: "#9B4F96" },
  { name: "C++", icon: "cplusplus", color: "#00599C" },
  { name: "Go", icon: "go", color: "#00ADD8" },
  { name: "Rust", icon: "rust", color: "#DEA584" },
  { name: "Kotlin", icon: "kotlin", color: "#7F52FF" },
  { name: "Swift", icon: "swift", color: "#F05138" },
  { name: "Dart", icon: "dart", color: "#0175C2" },
  { name: "SQL", icon: "database", color: "#00F5FF" },
  { name: "HTML5", icon: "html5", color: "#E34F26" },
  { name: "CSS3", icon: "css", color: "#663399" },
];

export const techCategories: TechCategory[] = [
  {
    id: "frameworks",
    label: "Frameworks",
    description:
      "Building products on battle-tested, modern frameworks across web, mobile and desktop.",
    items: [
      { name: "React", icon: "react", color: "#61DAFB" },
      { name: "Next.js", icon: "nextjs", color: "#FFFFFF" },
      { name: "Vue.js", icon: "vue", color: "#4FC08D" },
      { name: "Angular", icon: "angular", color: "#DD0031" },
      { name: "Laravel", icon: "laravel", color: "#FF2D20" },
      { name: "CodeIgniter", icon: "codeigniter", color: "#EE4323" },
      { name: "Node.js", icon: "nodejs", color: "#339933" },
      { name: "Express.js", icon: "express", color: "#FFFFFF" },
      { name: "NestJS", icon: "nestjs", color: "#E0234E" },
      { name: "ASP.NET", icon: "dotnet", color: "#512BD4" },
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "React Native", icon: "react", color: "#61DAFB" },
      { name: "Electron", icon: "electron", color: "#47848F" },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    description:
      "Designing performant, reliable data layers — relational, NoSQL and in-memory.",
    items: [
      { name: "MySQL", icon: "mysql", color: "#4479A1" },
      { name: "MariaDB", icon: "mariadb", color: "#003545" },
      { name: "PostgreSQL", icon: "postgresql", color: "#4169E1" },
      { name: "MongoDB", icon: "mongodb", color: "#47A248" },
      { name: "Redis", icon: "redis", color: "#DC382D" },
      { name: "SQLite", icon: "sqlite", color: "#003B57" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "Supabase", icon: "supabase", color: "#3ECF8E" },
    ],
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    description:
      "Shipping and scaling software with modern infrastructure, containers and CI/CD pipelines.",
    items: [
      { name: "Docker", icon: "docker", color: "#2496ED" },
      { name: "Linux", icon: "linux", color: "#FCC624" },
      { name: "Ubuntu", icon: "ubuntu", color: "#E95420" },
      { name: "Nginx", icon: "nginx", color: "#009639" },
      { name: "Apache", icon: "apache", color: "#D22128" },
      { name: "Git", icon: "git", color: "#F05032" },
      { name: "GitHub", icon: "github", color: "#FFFFFF" },
      { name: "GitLab", icon: "gitlab", color: "#FC6D26" },
      { name: "Vercel", icon: "vercel", color: "#FFFFFF" },
      { name: "Cloudflare", icon: "cloudflare", color: "#F38020" },
      { name: "DigitalOcean", icon: "digitalocean", color: "#0080FF" },
      { name: "AWS", icon: "cloud", color: "#FF9900" },
      { name: "Google Cloud", icon: "cloudcog", color: "#4285F4" },
      { name: "Azure", icon: "cloud", color: "#00A4EF" },
      { name: "CI/CD", icon: "workflow", color: "#00F5FF" },
    ],
  },
  {
    id: "ai",
    label: "AI & Automation",
    description:
      "Engineering intelligent systems — from LLM integrations to fully automated pipelines.",
    items: [
      { name: "OpenAI API", icon: "openai", color: "#FFFFFF" },
      { name: "ChatGPT Integration", icon: "messages", color: "#10A37F" },
      { name: "AI Assistants", icon: "bot", color: "#00F5FF" },
      { name: "Prompt Engineering", icon: "wand", color: "#7C3AED" },
      { name: "Automation Systems", icon: "workflow", color: "#00FF88" },
      { name: "Web Scraping", icon: "globe", color: "#00F5FF" },
      { name: "Machine Learning", icon: "brain", color: "#7C3AED" },
      { name: "LLM Applications", icon: "cpu", color: "#00FF88" },
    ],
  },
];

export interface SkillLevel {
  name: string;
  level: number;
  category: string;
}

export const skillLevels: SkillLevel[] = [
  { name: "PHP / Laravel", level: 96, category: "Backend" },
  { name: "JavaScript / TypeScript", level: 95, category: "Language" },
  { name: "React / Next.js", level: 94, category: "Frontend" },
  { name: "Node.js / NestJS", level: 91, category: "Backend" },
  { name: "Database Architecture", level: 92, category: "Data" },
  { name: "AI & LLM Integration", level: 89, category: "AI" },
  { name: "DevOps & Cloud", level: 86, category: "Infrastructure" },
  { name: "Mobile Development", level: 84, category: "Mobile" },
  { name: "UI / UX Engineering", level: 90, category: "Design" },
  { name: "System Architecture", level: 93, category: "Architecture" },
];

export interface ServiceItem {
  /** key into icons.ts */
  icon: string;
  title: string;
  description: string;
  /** which functional block of the die this service occupies (Act III) */
  block: "core" | "cache" | "memory" | "gpu" | "io" | "npu";
}

export const services: ServiceItem[] = [
  {
    icon: "code",
    title: "Custom Software Development",
    description:
      "Tailor-made software engineered around your exact workflows, built to scale from day one.",
    block: "core",
  },
  {
    icon: "globe",
    title: "Web Application Development",
    description:
      "Blazing-fast, responsive web apps using Next.js, React and modern full-stack architectures.",
    block: "core",
  },
  {
    icon: "smartphone",
    title: "Mobile App Development",
    description:
      "Cross-platform native-feel apps with Flutter and React Native for iOS and Android.",
    block: "core",
  },
  {
    icon: "brain",
    title: "AI Solutions",
    description:
      "LLM-powered assistants, automation and intelligent features integrated into your products.",
    block: "npu",
  },
  {
    icon: "server",
    title: "API Development",
    description:
      "Secure, documented and high-performance REST & GraphQL APIs built for real scale.",
    block: "io",
  },
  {
    icon: "database",
    title: "Database Design",
    description:
      "Optimized schemas and data architecture across SQL & NoSQL for speed and integrity.",
    block: "memory",
  },
  {
    icon: "workflow",
    title: "Automation Systems",
    description:
      "Custom bots, scrapers and pipelines that eliminate repetitive work and save hours daily.",
    block: "core",
  },
  {
    icon: "shield",
    title: "DevOps Solutions",
    description:
      "CI/CD pipelines, containerization and infrastructure that ship code safely and fast.",
    block: "io",
  },
  {
    icon: "cloudupload",
    title: "Cloud Architecture",
    description:
      "Resilient, cost-efficient cloud infrastructure on AWS, GCP, Azure and Vercel.",
    block: "io",
  },
  {
    icon: "boxes",
    title: "E-Commerce Systems",
    description:
      "Conversion-focused storefronts, payment integrations and inventory systems that sell.",
    block: "gpu",
  },
  {
    icon: "gitbranch",
    title: "Enterprise Solutions",
    description:
      "Mission-critical systems engineered for reliability, security and long-term maintainability.",
    block: "cache",
  },
  {
    icon: "layers",
    title: "SaaS Development",
    description:
      "End-to-end SaaS platforms — auth, billing, multi-tenancy and dashboards, built to scale.",
    block: "cache",
  },
];

export interface ProjectItem {
  slug: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  /** Only real URLs are rendered as links. */
  github?: string;
  demo?: string;
}

export const projects: ProjectItem[] = [
  {
    slug: "ai-legal-assistant",
    title: "AI Legal Assistant",
    category: "AI / SaaS",
    description:
      "An AI-powered legal research and document assistant that analyzes contracts, answers legal queries and drafts documents using LLM pipelines.",
    tech: ["Next.js", "OpenAI API", "PostgreSQL", "Tailwind CSS"],
  },
  {
    slug: "smm-panel",
    title: "SMM Panel System",
    category: "SaaS Platform",
    description:
      "A full-featured social media marketing panel with provider integrations, automated order processing and a real-time admin dashboard.",
    tech: ["Laravel", "MySQL", "Redis", "Vue.js"],
  },
  {
    slug: "vehicle-management",
    title: "Vehicle Management System",
    category: "Enterprise",
    description:
      "An enterprise fleet and vehicle management platform covering maintenance tracking, driver assignments and live reporting.",
    tech: ["React", "Node.js", "PostgreSQL", "Docker"],
  },
  {
    slug: "live-score",
    title: "Live Score Application",
    category: "Real-Time / Mobile",
    description:
      "A real-time sports score application with live match updates, push notifications and a smooth cross-platform mobile experience.",
    tech: ["Flutter", "Node.js", "WebSockets", "Firebase"],
  },
  {
    slug: "qr-menu",
    title: "QR Menu Platform",
    category: "Web Application",
    description:
      "A contactless restaurant menu platform with QR-based ordering, multi-language support and a live menu management dashboard.",
    tech: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
  },
  {
    slug: "crm",
    title: "CRM Software",
    category: "Enterprise",
    description:
      "A customer relationship management system with pipeline automation, analytics dashboards and team collaboration tools.",
    tech: ["React", "NestJS", "PostgreSQL", "Redis"],
  },
  {
    slug: "erp",
    title: "ERP System",
    category: "Enterprise",
    description:
      "A modular enterprise resource planning system covering inventory, HR, accounting and procurement in one unified platform.",
    tech: ["Laravel", "Vue.js", "MySQL", "Docker"],
  },
  {
    slug: "ecommerce",
    title: "E-Commerce Platform",
    category: "E-Commerce",
    description:
      "A high-performance storefront with custom checkout, dynamic catalog, payment gateways and an analytics-driven admin panel.",
    tech: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
  },
  {
    slug: "saas-boilerplate",
    title: "Custom SaaS Solutions",
    category: "SaaS Platform",
    description:
      "A multi-tenant SaaS boilerplate with subscription billing, role-based access and a fully themeable dashboard architecture.",
    tech: ["Next.js", "TypeScript", "Supabase", "AWS"],
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  /** key into icons.ts */
  icon: string;
  /** pipeline stage label used in Act IV */
  stage: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    description:
      "Deep-dive into your goals, users and constraints to define what success actually looks like.",
    icon: "compass",
    stage: "discover",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "Mapping the roadmap, scope and milestones into a clear, actionable execution plan.",
    icon: "ruler",
    stage: "plan",
  },
  {
    number: "03",
    title: "Architecture",
    description:
      "Designing scalable system architecture, data models and technology decisions that last.",
    icon: "layers",
    stage: "design",
  },
  {
    number: "04",
    title: "Development",
    description:
      "Writing clean, tested, production-grade code in focused, transparent sprints.",
    icon: "hammer",
    stage: "build",
  },
  {
    number: "05",
    title: "Testing",
    description:
      "Rigorous QA across devices, edge cases and performance budgets before anything ships.",
    icon: "testtube",
    stage: "test",
  },
  {
    number: "06",
    title: "Deployment",
    description:
      "Zero-downtime releases with CI/CD pipelines, monitoring and rollback safety nets.",
    icon: "rocket",
    stage: "deploy",
  },
  {
    number: "07",
    title: "Maintenance",
    description:
      "Ongoing support, optimization and iteration to keep your product fast and secure.",
    icon: "wrench",
    stage: "monitor",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  /**
   * Only verified testimonials are ever rendered. Nothing here has been
   * verified with its author yet, so every entry stays `false` and the
   * testimonial section renders nothing.
   */
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    name: "Mert Aydın",
    role: "Founder",
    company: "NovaCommerce",
    quote:
      "Osman rebuilt our entire e-commerce platform from scratch. The performance gains and the new admin dashboard completely changed how our team operates.",
    verified: false,
  },
  {
    name: "Elif Kara",
    role: "Product Manager",
    company: "Finlytics",
    quote:
      "Working with Osman felt like having a senior engineering team in one person. Clear communication, clean architecture, and delivered ahead of schedule.",
    verified: false,
  },
  {
    name: "Daniel Reyes",
    role: "CTO",
    company: "Skyline Logistics",
    quote:
      "The vehicle management system Osman built handles thousands of records daily without a hiccup. Rock-solid backend and a beautiful interface.",
    verified: false,
  },
  {
    name: "Aylin Demir",
    role: "CEO",
    company: "BrightDesk SaaS",
    quote:
      "From architecture to deployment, Osman owned the entire stack. The AI features he integrated became our biggest selling point.",
    verified: false,
  },
  {
    name: "James Carter",
    role: "Operations Director",
    company: "QuickServe Restaurants",
    quote:
      "The QR menu platform was delivered fast, looks premium, and our customers love it. Exactly the kind of polish we were looking for.",
    verified: false,
  },
];

export const verifiedTestimonials = testimonials.filter((t) => t.verified);

export const budgetOptions = [
  "Under $1,000",
  "$1,000 - $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000+",
  "Let's discuss",
];

/** Returns true only for links that go somewhere. */
export function isRealUrl(href?: string): href is string {
  return !!href && /^https?:\/\//.test(href);
}
