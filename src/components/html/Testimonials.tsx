import { verifiedTestimonials } from "@/lib/data";

/**
 * Renders only testimonials whose authors have verified them. With none
 * verified, this renders nothing at all: no section, no heading, no anchor.
 */
export default function Testimonials() {
  if (verifiedTestimonials.length === 0) return null;
  return (
    <section
      id="testimonials"
      className="section"
      aria-labelledby="testimonials-title"
    >
      <div className="panel">
        <div className="panel-body">
          <div className="wrap">
            <div className="glass max-w-[60rem] p-6 sm:p-9">
              <p className="eyebrow mb-4">
                <b>cat</b> ~/testimonials.log
              </p>
              <h2 id="testimonials-title" className="display h2">
                Verified words.
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {verifiedTestimonials.map((t) => (
                  <li key={`${t.name}-${t.company}`} className="card">
                    <blockquote className="text-sm leading-relaxed text-text-2">
                      “{t.quote}”
                    </blockquote>
                    <p className="mono mt-3 text-xs">
                      {t.name} · {t.role}, {t.company}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
