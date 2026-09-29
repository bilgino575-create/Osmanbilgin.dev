import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TechStack from "@/components/sections/TechStack";
import TechUniverse from "@/components/sections/TechUniverse";
import Skills from "@/components/sections/Skills";
import Services from "@/components/sections/Services";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import Achievements from "@/components/sections/Achievements";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <TechStack />
      <TechUniverse />
      <Skills />
      <Services />
      <Projects />
      <Process />
      <Achievements />
      <Testimonials />
      <Contact />
    </>
  );
}
