export function scrollToSection(id: string) {
  const target = id.startsWith("#") ? id : `#${id}`;

  if (typeof window !== "undefined" && window.__lenis) {
    window.__lenis.scrollTo(target, {
      offset: -88,
      duration: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }

  if (typeof document !== "undefined") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}
