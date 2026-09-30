import { siteConfig } from "@/lib/data";
import { Section } from "./Track";

export default function Hero() {
  return (
    <Section id="home" className="hero">
      <div className="wrap">
        <div className="max-w-[44rem] pb-14 sm:pb-0">
          <p className="eyebrow mb-6">
            <b>{siteConfig.handle}</b>:~$ whoami
          </p>
          <h1 id="home-title" className="display h1">
            {siteConfig.firstName} {siteConfig.lastName}.
          </h1>
          <p className="mt-5 text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-text-2">
            Full stack developer, software engineer, AI system architect.
          </p>
          <ul className="sr-only" aria-label="Titles">
            {siteConfig.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="lede mt-6">
            {siteConfig.tagline[0].charAt(0) + siteConfig.tagline[0].slice(1).toLowerCase()}{" "}
            {siteConfig.tagline[1].toLowerCase()}. {siteConfig.description}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a className="btn btn-solid" href="#about">
              Boot into the system
            </a>
            <a className="link" href="#contact">
              Get in touch
            </a>
          </div>
          <p className="eyebrow mt-10 hidden sm:block">
            Scroll to enter · <span className="kbd">⌘K</span> command palette · <span className="kbd">D</span> devtools
          </p>
        </div>
      </div>
    </Section>
  );
}
