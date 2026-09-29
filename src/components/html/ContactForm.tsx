"use client";

import { useState, type FormEvent } from "react";
import { budgetOptions, siteConfig } from "@/lib/data";
import { store } from "@/lib/store";

/**
 * The contact form styled as an ssh session. Submission keeps the mailto
 * behaviour: it composes a message to the real address and lets the visitor's
 * mail client send it. Nothing is posted to a server.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "");
    const email = String(f.get("email") ?? "");
    const budget = String(f.get("budget") ?? "");
    const message = String(f.get("message") ?? "");
    const subject = `New Project Inquiry from ${name || "Website"}`;
    const body = [`Name: ${name}`, `Email: ${email}`, `Budget: ${budget}`, "", message].join(
      "\n"
    );
    store.set({ sentAt: performance.now() });
    setSent(true);
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="term mt-6 grid gap-3" onSubmit={onSubmit} aria-describedby="contact-help">
      <p id="contact-help" className="d">
        # fields are sent through your own mail client
      </p>
      <div className="term-field">
        <label htmlFor="c-name">
          <span className="p">$</span> name
        </label>
        <input id="c-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="term-field">
        <label htmlFor="c-email">
          <span className="p">$</span> reply-to
        </label>
        <input id="c-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="term-field">
        <label htmlFor="c-budget">
          <span className="p">$</span> budget
        </label>
        <select id="c-budget" name="budget" defaultValue={budgetOptions[budgetOptions.length - 1]}>
          {budgetOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="term-field">
        <label htmlFor="c-message">
          <span className="p">$</span> message
        </label>
        <textarea id="c-message" name="message" rows={4} required />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-solid">
          send ⏎
        </button>
        <span className={sent ? "g" : "d"} aria-live="polite">
          {sent
            ? "→ packet sent · opening your mail client"
            : "→ opens mail client · nothing is stored"}
        </span>
      </div>
    </form>
  );
}
