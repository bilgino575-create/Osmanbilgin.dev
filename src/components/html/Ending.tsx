import { siteConfig } from "@/lib/data";
import { Section } from "./Track";

export default function Ending() {
  return (
    <Section id="end" align="center">
      <div className="wrap text-center">
        <p className="eyebrow mb-5">
          <b>status</b> · {new Date().getFullYear()}
        </p>
        <h2 id="end-title" className="display h2">
          <span className="inline-flex items-center gap-4">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full bg-green shadow-[0_0_18px_var(--green)]"
            />
            {siteConfig.availability}
          </span>
        </h2>
        <p className="lede mx-auto mt-5">
          One window is still lit. Send a message and it reaches the desk.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className="btn btn-solid" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          <a className="btn" href="#home">
            Back to the desk
          </a>
        </div>
      </div>
    </Section>
  );
}
