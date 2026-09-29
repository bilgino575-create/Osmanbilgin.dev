import { siteConfig } from "@/lib/data";
import { Section } from "./Track";

export default function Hero() {
  return (
    <Section id="home" className="hero">
      <div className="wrap">
        <div className="max-w-[46rem]">
          <p className="eyebrow mb-5">
            <b>{siteConfig.handle}</b>:~$ whoami
          </p>
          <h1 id="home-title" className="display h1">
            {siteConfig.firstName}
            <br />
            {siteConfig.lastName}
          </h1>
          <ul
            className="mono mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-text-2"
            aria-label="Titles"
          >
            {siteConfig.titles.map((t, i) => (
              <li key={t} className="flex items-center gap-4">
                {i > 0 && (
                  <span aria-hidden="true" className="text-muted">
                    /
                  </span>
                )}
                {t}
              </li>
            ))}
          </ul>
          <p className="lede mt-7">
            {siteConfig.tagline[0].charAt(0) +
              siteConfig.tagline[0].slice(1).toLowerCase()}{" "}
            {siteConfig.tagline[1].toLowerCase()}. {siteConfig.description}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a className="btn btn-solid" href="#about">
              Boot into the system
            </a>
            <a className="btn" href="#contact">
              ssh hello@osmanbilgin.dev
            </a>
          </div>
          <p className="eyebrow mt-10 hidden gl-only sm:block">
            Scroll to enter · <span className="kbd">~</span> command palette ·{" "}
            <span className="kbd">D</span> devtools
          </p>
        </div>
      </div>
    </Section>
  );
}
