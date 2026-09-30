import { siteConfig } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Section } from "./Track";
import ContactForm from "./ContactForm";

export default function Contact() {
  const Mail = getIcon("mail");
  const Phone = getIcon("phone");
  const Instagram = getIcon("instagram");
  const links = [
    { Icon: Mail, label: "email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { Icon: Phone, label: "phone", value: siteConfig.phoneDisplay, href: siteConfig.phoneHref },
    {
      Icon: Instagram,
      label: "instagram",
      value: siteConfig.instagram,
      href: siteConfig.instagramUrl,
      external: true,
    },
  ];
  return (
    <Section id="contact">
      <div className="wrap">
        <div className="glass grid max-w-[40rem] gap-6 p-6 sm:p-9">
          <div>
            <p className="eyebrow mb-4">
              <b>$</b> ssh hello@osmanbilgin.dev
            </p>
            <h2 id="contact-title" className="display h2">
              Open a session.
            </h2>
            <p className="lede mt-4">
              Tell me what you are building. The message travels back through the
              network to the desk and lights up the phone.
            </p>
            <ContactForm />
          </div>
          <div className="term border-t border-line pt-5">
            <p className="d"># reachable directly</p>
            <ul className="mt-2 grid gap-2">
              {links.map(({ Icon, label, value, href, external }) => (
                <li key={label} className="flex flex-wrap items-center gap-x-3 gap-y-0">
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                  <span className="d w-20 shrink-0">{label}</span>
                  <a
                    href={href}
                    className="break-all hover:text-accent"
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
