import { isRealUrl, projects } from "@/lib/data";
import { Section } from "./Track";

export default function Work() {
  return (
    <Section id="work" align="right">
      <div className="wrap">
        <div className="glass ml-auto max-w-[40rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>tree</b> ~/projects
          </p>
          <h2 id="work-title" className="display h2">
            {projects.length} folders.
            <br />
            Every one shipped.
          </h2>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.slug} className="card flex flex-col" id={`project-${p.slug}`}>
                <p className="eyebrow">
                  <b>▸</b> {p.slug}/
                </p>
                <h3 className="mt-1.5 text-base font-medium leading-tight">{p.title}</h3>
                <p className="mono mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {p.category}
                </p>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-text-2">
                  {p.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                  {p.tech.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
                {(isRealUrl(p.github) || isRealUrl(p.demo)) && (
                  <p className="mono mt-4 flex gap-4 text-xs">
                    {isRealUrl(p.github) && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer">
                        source ↗
                      </a>
                    )}
                    {isRealUrl(p.demo) && (
                      <a href={p.demo} target="_blank" rel="noopener noreferrer">
                        live ↗
                      </a>
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
