import type { ComponentType, SVGProps } from "react";
import {
  SiPhp,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiOpenjdk,
  SiSharp,
  SiCplusplus,
  SiGo,
  SiRust,
  SiKotlin,
  SiSwift,
  SiDart,
  SiHtml5,
  SiCss,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiLaravel,
  SiCodeigniter,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiDotnet,
  SiFlutter,
  SiElectron,
  SiMysql,
  SiMariadb,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiSqlite,
  SiFirebase,
  SiSupabase,
  SiDocker,
  SiLinux,
  SiUbuntu,
  SiNginx,
  SiApache,
  SiGit,
  SiGithub,
  SiGitlab,
  SiVercel,
  SiCloudflare,
  SiDigitalocean,
  SiOpenai,
} from "react-icons/si";
import {
  Database,
  Cloud,
  CloudCog,
  Workflow,
  Bot,
  MessagesSquare,
  Sparkles,
  Wand2,
  Globe2,
  BrainCircuit,
  Cpu,
  Code2,
  Smartphone,
  Server,
  ShieldCheck,
  GitBranch,
  Boxes,
  Layers,
  Rocket,
  Gauge,
  Compass,
  PencilRuler,
  Hammer,
  TestTube2,
  CloudUpload,
  Wrench,
} from "lucide-react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const siteConfig = {
  name: "Osman Bilgin",
  firstName: "Osman",
  lastName: "Bilgin",
  initials: "OB",
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
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const heroStats = [
  { value: 100, suffix: "+", label: "Projects" },
  { value: 30, suffix: "+", label: "Technologies" },
  { value: 24, suffix: "/7", label: "Development" },
  { value: 0, suffix: "∞", label: "Creativity", isInfinity: true },
];

export const aboutHighlights = [
  {
    icon: Code2,
    title: "Enterprise-Grade Code",
    description:
      "Clean architecture, scalable systems and maintainable code that's built to grow with your business.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Systems",
    description:
      "From LLM integrations to intelligent automation, I bring next-generation AI into real products.",
  },
  {
    icon: Layers,
    title: "Full Spectrum Stack",
    description:
      "Web, mobile, backend, databases, DevOps and cloud — one engineer who ships the entire pipeline.",
  },
  {
    icon: Rocket,
    title: "Performance Obsessed",
    description:
      "Lighthouse-perfect, SEO-ready and production-hardened experiences deployed on modern infrastructure.",
  },
];

export interface TechItem {
  name: string;
  icon: IconComponent;
  color: string;
}

export interface TechCategory {
  id: string;
  label: string;
  description: string;
  accent: string;
  items: TechItem[];
}

export const languages: TechItem[] = [
  { name: "PHP", icon: SiPhp, color: "#8993BE" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Java", icon: SiOpenjdk, color: "#EA2D2E" },
  { name: "C#", icon: SiSharp, color: "#9B4F96" },
  { name: "C++", icon: SiCplusplus, color: "#00599C" },
  { name: "Go", icon: SiGo, color: "#00ADD8" },
  { name: "Rust", icon: SiRust, color: "#DEA584" },
  { name: "Kotlin", icon: SiKotlin, color: "#7F52FF" },
  { name: "Swift", icon: SiSwift, color: "#F05138" },
  { name: "Dart", icon: SiDart, color: "#0175C2" },
  { name: "SQL", icon: Database as unknown as IconComponent, color: "#00F5FF" },
  { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", icon: SiCss, color: "#663399" },
];

export const techCategories: TechCategory[] = [
  {
    id: "frameworks",
    label: "Frameworks",
    description: "Building products on battle-tested, modern frameworks across web, mobile and desktop.",
    accent: "var(--color-accent)",
    items: [
      { name: "React", icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF" },
      { name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D" },
      { name: "Angular", icon: SiAngular, color: "#DD0031" },
      { name: "Laravel", icon: SiLaravel, color: "#FF2D20" },
      { name: "CodeIgniter", icon: SiCodeigniter, color: "#EE4323" },
      { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { name: "Express.js", icon: SiExpress, color: "#FFFFFF" },
      { name: "NestJS", icon: SiNestjs, color: "#E0234E" },
      { name: "ASP.NET", icon: SiDotnet, color: "#512BD4" },
      { name: "Flutter", icon: SiFlutter, color: "#02569B" },
      { name: "React Native", icon: SiReact, color: "#61DAFB" },
      { name: "Electron", icon: SiElectron, color: "#47848F" },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    description: "Designing performant, reliable data layers — relational, NoSQL and in-memory.",
    accent: "var(--color-accent-2)",
    items: [
      { name: "MySQL", icon: SiMysql, color: "#4479A1" },
      { name: "MariaDB", icon: SiMariadb, color: "#003545" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
      { name: "Redis", icon: SiRedis, color: "#DC382D" },
      { name: "SQLite", icon: SiSqlite, color: "#003B57" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
      { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
    ],
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    description: "Shipping and scaling software with modern infrastructure, containers and CI/CD pipelines.",
    accent: "var(--color-accent-3)",
    items: [
      { name: "Docker", icon: SiDocker, color: "#2496ED" },
      { name: "Linux", icon: SiLinux, color: "#FCC624" },
      { name: "Ubuntu", icon: SiUbuntu, color: "#E95420" },
      { name: "Nginx", icon: SiNginx, color: "#009639" },
      { name: "Apache", icon: SiApache, color: "#D22128" },
      { name: "Git", icon: SiGit, color: "#F05032" },
      { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
      { name: "GitLab", icon: SiGitlab, color: "#FC6D26" },
      { name: "Vercel", icon: SiVercel, color: "#FFFFFF" },
      { name: "Cloudflare", icon: SiCloudflare, color: "#F38020" },
      { name: "DigitalOcean", icon: SiDigitalocean, color: "#0080FF" },
      { name: "AWS", icon: Cloud as unknown as IconComponent, color: "#FF9900" },
      { name: "Google Cloud", icon: CloudCog as unknown as IconComponent, color: "#4285F4" },
      { name: "Azure", icon: Cloud as unknown as IconComponent, color: "#00A4EF" },
      { name: "CI/CD", icon: Workflow as unknown as IconComponent, color: "#00F5FF" },
    ],
  },
  {
    id: "ai",
    label: "AI & Automation",
    description: "Engineering intelligent systems — from LLM integrations to fully automated pipelines.",
    accent: "var(--color-accent)",
    items: [
      { name: "OpenAI API", icon: SiOpenai, color: "#FFFFFF" },
      { name: "ChatGPT Integration", icon: MessagesSquare as unknown as IconComponent, color: "#10A37F" },
      { name: "AI Assistants", icon: Bot as unknown as IconComponent, color: "#00F5FF" },
      { name: "Prompt Engineering", icon: Wand2 as unknown as IconComponent, color: "#7C3AED" },
      { name: "Automation Systems", icon: Workflow as unknown as IconComponent, color: "#00FF88" },
      { name: "Web Scraping", icon: Globe2 as unknown as IconComponent, color: "#00F5FF" },
      { name: "Machine Learning", icon: BrainCircuit as unknown as IconComponent, color: "#7C3AED" },
      { name: "LLM Applications", icon: Cpu as unknown as IconComponent, color: "#00FF88" },
      { name: "Sparkles", icon: Sparkles as unknown as IconComponent, color: "#00F5FF" },
    ].slice(0, 8),
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
  icon: IconComponent;
  title: string;
  description: string;
}

export const services: ServiceItem[] = [
  {
    icon: Code2 as unknown as IconComponent,
    title: "Custom Software Development",
    description: "Tailor-made software engineered around your exact workflows, built to scale from day one.",
  },
  {
    icon: Globe2 as unknown as IconComponent,
    title: "Web Application Development",
    description: "Blazing-fast, responsive web apps using Next.js, React and modern full-stack architectures.",
  },
  {
    icon: Smartphone as unknown as IconComponent,
    title: "Mobile App Development",
    description: "Cross-platform native-feel apps with Flutter and React Native for iOS and Android.",
  },
  {
    icon: BrainCircuit as unknown as IconComponent,
    title: "AI Solutions",
    description: "LLM-powered assistants, automation and intelligent features integrated into your products.",
  },
  {
    icon: Server as unknown as IconComponent,
    title: "API Development",
    description: "Secure, documented and high-performance REST & GraphQL APIs built for real scale.",
  },
  {
    icon: Database as unknown as IconComponent,
    title: "Database Design",
    description: "Optimized schemas and data architecture across SQL & NoSQL for speed and integrity.",
  },
  {
    icon: Workflow as unknown as IconComponent,
    title: "Automation Systems",
    description: "Custom bots, scrapers and pipelines that eliminate repetitive work and save hours daily.",
  },
  {
    icon: ShieldCheck as unknown as IconComponent,
    title: "DevOps Solutions",
    description: "CI/CD pipelines, containerization and infrastructure that ship code safely and fast.",
  },
  {
    icon: CloudUpload as unknown as IconComponent,
    title: "Cloud Architecture",
    description: "Resilient, cost-efficient cloud infrastructure on AWS, GCP, Azure and Vercel.",
  },
  {
    icon: Boxes as unknown as IconComponent,
    title: "E-Commerce Systems",
    description: "Conversion-focused storefronts, payment integrations and inventory systems that sell.",
  },
  {
    icon: GitBranch as unknown as IconComponent,
    title: "Enterprise Solutions",
    description: "Mission-critical systems engineered for reliability, security and long-term maintainability.",
  },
  {
    icon: Layers as unknown as IconComponent,
    title: "SaaS Development",
    description: "End-to-end SaaS platforms — auth, billing, multi-tenancy and dashboards, built to scale.",
  },
];

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  tech: string[];
  gradient: [string, string];
  github: string;
  demo: string;
}

export const projects: ProjectItem[] = [
  {
    title: "AI Legal Assistant",
    category: "AI / SaaS",
    description:
      "An AI-powered legal research and document assistant that analyzes contracts, answers legal queries and drafts documents using LLM pipelines.",
    tech: ["Next.js", "OpenAI API", "PostgreSQL", "Tailwind CSS"],
    gradient: ["#00F5FF", "#7C3AED"],
    github: "#",
    demo: "#",
  },
  {
    title: "SMM Panel System",
    category: "SaaS Platform",
    description:
      "A full-featured social media marketing panel with provider integrations, automated order processing and a real-time admin dashboard.",
    tech: ["Laravel", "MySQL", "Redis", "Vue.js"],
    gradient: ["#7C3AED", "#00FF88"],
    github: "#",
    demo: "#",
  },
  {
    title: "Vehicle Management System",
    category: "Enterprise",
    description:
      "An enterprise fleet and vehicle management platform covering maintenance tracking, driver assignments and live reporting.",
    tech: ["React", "Node.js", "PostgreSQL", "Docker"],
    gradient: ["#00FF88", "#00F5FF"],
    github: "#",
    demo: "#",
  },
  {
    title: "Live Score Application",
    category: "Real-Time / Mobile",
    description:
      "A real-time sports score application with live match updates, push notifications and a smooth cross-platform mobile experience.",
    tech: ["Flutter", "Node.js", "WebSockets", "Firebase"],
    gradient: ["#00F5FF", "#7C3AED"],
    github: "#",
    demo: "#",
  },
  {
    title: "QR Menu Platform",
    category: "Web Application",
    description:
      "A contactless restaurant menu platform with QR-based ordering, multi-language support and a live menu management dashboard.",
    tech: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    gradient: ["#7C3AED", "#00F5FF"],
    github: "#",
    demo: "#",
  },
  {
    title: "CRM Software",
    category: "Enterprise",
    description:
      "A customer relationship management system with pipeline automation, analytics dashboards and team collaboration tools.",
    tech: ["React", "NestJS", "PostgreSQL", "Redis"],
    gradient: ["#00FF88", "#7C3AED"],
    github: "#",
    demo: "#",
  },
  {
    title: "ERP System",
    category: "Enterprise",
    description:
      "A modular enterprise resource planning system covering inventory, HR, accounting and procurement in one unified platform.",
    tech: ["Laravel", "Vue.js", "MySQL", "Docker"],
    gradient: ["#00F5FF", "#00FF88"],
    github: "#",
    demo: "#",
  },
  {
    title: "E-Commerce Platform",
    category: "E-Commerce",
    description:
      "A high-performance storefront with custom checkout, dynamic catalog, payment gateways and an analytics-driven admin panel.",
    tech: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
    gradient: ["#7C3AED", "#00FF88"],
    github: "#",
    demo: "#",
  },
  {
    title: "Custom SaaS Solutions",
    category: "SaaS Platform",
    description:
      "A multi-tenant SaaS boilerplate with subscription billing, role-based access and a fully themeable dashboard architecture.",
    tech: ["Next.js", "TypeScript", "Supabase", "AWS"],
    gradient: ["#00F5FF", "#7C3AED"],
    github: "#",
    demo: "#",
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: IconComponent;
}

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    description: "Deep-dive into your goals, users and constraints to define what success actually looks like.",
    icon: Compass as unknown as IconComponent,
  },
  {
    number: "02",
    title: "Planning",
    description: "Mapping the roadmap, scope and milestones into a clear, actionable execution plan.",
    icon: PencilRuler as unknown as IconComponent,
  },
  {
    number: "03",
    title: "Architecture",
    description: "Designing scalable system architecture, data models and technology decisions that last.",
    icon: Layers as unknown as IconComponent,
  },
  {
    number: "04",
    title: "Development",
    description: "Writing clean, tested, production-grade code in focused, transparent sprints.",
    icon: Hammer as unknown as IconComponent,
  },
  {
    number: "05",
    title: "Testing",
    description: "Rigorous QA across devices, edge cases and performance budgets before anything ships.",
    icon: TestTube2 as unknown as IconComponent,
  },
  {
    number: "06",
    title: "Deployment",
    description: "Zero-downtime releases with CI/CD pipelines, monitoring and rollback safety nets.",
    icon: Rocket as unknown as IconComponent,
  },
  {
    number: "07",
    title: "Maintenance",
    description: "Ongoing support, optimization and iteration to keep your product fast and secure.",
    icon: Wrench as unknown as IconComponent,
  },
];

export interface Achievement {
  value: number;
  suffix: string;
  label: string;
  icon: IconComponent;
}

export const achievements: Achievement[] = [
  { value: 100, suffix: "+", label: "Projects Completed", icon: Rocket as unknown as IconComponent },
  { value: 50, suffix: "+", label: "Happy Clients", icon: Sparkles as unknown as IconComponent },
  { value: 12000, suffix: "+", label: "Hours of Development", icon: Gauge as unknown as IconComponent },
  { value: 30, suffix: "+", label: "Technologies Mastered", icon: Boxes as unknown as IconComponent },
];

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Mert Aydın",
    role: "Founder",
    company: "NovaCommerce",
    quote:
      "Osman rebuilt our entire e-commerce platform from scratch. The performance gains and the new admin dashboard completely changed how our team operates.",
  },
  {
    name: "Elif Kara",
    role: "Product Manager",
    company: "Finlytics",
    quote:
      "Working with Osman felt like having a senior engineering team in one person. Clear communication, clean architecture, and delivered ahead of schedule.",
  },
  {
    name: "Daniel Reyes",
    role: "CTO",
    company: "Skyline Logistics",
    quote:
      "The vehicle management system Osman built handles thousands of records daily without a hiccup. Rock-solid backend and a beautiful interface.",
  },
  {
    name: "Aylin Demir",
    role: "CEO",
    company: "BrightDesk SaaS",
    quote:
      "From architecture to deployment, Osman owned the entire stack. The AI features he integrated became our biggest selling point.",
  },
  {
    name: "James Carter",
    role: "Operations Director",
    company: "QuickServe Restaurants",
    quote:
      "The QR menu platform was delivered fast, looks premium, and our customers love it. Exactly the kind of polish we were looking for.",
  },
];

export const budgetOptions = [
  "Under $1,000",
  "$1,000 - $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000+",
  "Let's discuss",
];
