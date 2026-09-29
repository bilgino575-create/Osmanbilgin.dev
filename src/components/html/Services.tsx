import { services } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Section } from "./Track";

const blockLabel: Record<string, string> = {
  core: "CORE",
  cache: "L3 CACHE",
  memory: "MEM CTRL",
  gpu: "GPU",
  io: "I/O",
  npu: "NPU",
};

export default function Services() {
  return (
    <Section id="services">
      <div className="wrap">
        <div className="glass max-w-[46rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>lscpu</b> --services
          </p>
          <h2 id="services-title" className="display h2">
            {services.length} functional blocks
            <br />
            on one die.
          </h2>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {services.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <li key={s.title} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <span className="card-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="tag">{blockLabel[s.block]}</span>
                  </div>
                  <h3 className="mt-2.5 text-[15px] font-medium leading-tight">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-2">
                    {s.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
