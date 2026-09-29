import { aboutHighlights, siteConfig } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Section } from "./Track";

export default function About() {
  return (
    <Section id="about">
      <div className="wrap">
        <div className="glass max-w-[62rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>cat</b> ~/about.md
          </p>
          <h2 id="about-title" className="display h2">
            One engineer.
            <br />
            The entire pipeline.
          </h2>
          <p className="lede mt-5">
            {siteConfig.name} is a full stack developer, software engineer and
            AI system architect. {siteConfig.description}
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {aboutHighlights.map((h) => {
              const Icon = getIcon(h.icon);
              return (
                <li key={h.title} className="card flex gap-4">
                  <span className="card-icon shrink-0" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <h3 className="font-medium">{h.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-2">
                      {h.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
