import type { CSSProperties } from "react";
import { languages, techCategories } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Section } from "./Track";

export default function Stack() {
  return (
    <Section id="stack" align="left">
      <div className="wrap">
        <div className="glass max-w-[42rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>ls</b> ~/stack
          </p>
          <h2 id="stack-title" className="display h2">
            {languages.length} languages.
            <br />
            {techCategories.reduce((n, c) => n + c.items.length, 0)} tools.
          </h2>

          <h3 className="eyebrow mt-7 mb-3">languages/</h3>
          <ul className="flex flex-wrap gap-2" aria-label="Programming languages">
            {languages.map((l) => {
              const Icon = getIcon(l.icon);
              return (
                <li
                  key={l.name}
                  className="chip"
                  style={{ "--chip-c": l.color } as CSSProperties}
                >
                  <Icon aria-hidden="true" />
                  {l.name}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {techCategories.map((cat) => (
              <div key={cat.id}>
                <h3 className="eyebrow mb-1">{cat.id}/</h3>
                <p className="mb-3 text-sm text-text-2">{cat.description}</p>
                <ul className="flex flex-wrap gap-2" aria-label={cat.label}>
                  {cat.items.map((t) => {
                    const Icon = getIcon(t.icon);
                    return (
                      <li
                        key={`${cat.id}-${t.name}`}
                        className="chip"
                        style={{ "--chip-c": t.color } as CSSProperties}
                      >
                        <Icon aria-hidden="true" />
                        {t.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
