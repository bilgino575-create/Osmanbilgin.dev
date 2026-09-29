import { processSteps } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Section } from "./Track";

export default function Process() {
  return (
    <Section id="process" align="right">
      <div className="wrap">
        <div className="glass ml-auto max-w-[40rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>deploy</b> --pipeline
          </p>
          <h2 id="process-title" className="display h2">
            {processSteps.length} stages.
            <br />
            Zero surprises.
          </h2>
          <ol className="pipe mt-6" id="pipeline">
            {processSteps.map((step) => {
              const Icon = getIcon(step.icon);
              return (
                <li
                  key={step.number}
                  className="pipe-step"
                  data-stage={step.stage}
                  data-done="false"
                >
                  <span className="dot" aria-hidden="true">
                    <span className="idx">{step.number}</span>
                    <svg className="chk" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5 4.6 9 10 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium">{step.title}</h3>
                      <span className="mono flex items-center gap-2 text-[11px] text-muted">
                        <Icon aria-hidden="true" width={13} height={13} />
                        {step.stage}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-text-2">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}
