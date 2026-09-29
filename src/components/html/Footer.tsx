import { siteConfig } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="site-footer border-t border-line bg-bg/80 backdrop-blur-sm">
      <div className="wrap flex flex-col gap-3 py-6 text-xs text-text-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="mono">
          © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.url.replace("https://", "")}
        </p>
        <ul className="mono flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-cyan">
              {siteConfig.email}
            </a>
          </li>
          <li>
            <a href={siteConfig.phoneHref} className="hover:text-cyan">
              {siteConfig.phoneDisplay}
            </a>
          </li>
          <li>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan"
            >
              {siteConfig.instagram}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
