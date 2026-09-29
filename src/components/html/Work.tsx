import { isRealUrl, projects } from "@/lib/data";
import { Section } from "./Track";

export default function Work() {
  return (
    <Section id="work">
      <div className="wrap">
        <div className="glass max-w-[70rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>tree</b> ~/projects
          </p>
          <h2 id="work-title" className="display h2">
            {projects.length} folders.
            <br />
            Every one shipped.
          </h2>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.slug} className="card flex flex-col" id={`project-${p.slug}`}>
                <p className="eyebrow">
                  <b>▸</b> {p.slug}/
                </p>
                <h3 className="mt-2 text-lg font-medium leading-tight">{p.title}</h3>
                <p className="mono mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {p.category}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-2">
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
