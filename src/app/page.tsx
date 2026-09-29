import Track from "@/components/html/Track";
import Hero from "@/components/html/Hero";
import About from "@/components/html/About";
import Stack from "@/components/html/Stack";
import Work from "@/components/html/Work";
import Services from "@/components/html/Services";
import Skills from "@/components/html/Skills";
import Process from "@/components/html/Process";
import Contact from "@/components/html/Contact";
import Testimonials from "@/components/html/Testimonials";
import Ending from "@/components/html/Ending";

export default function Home() {
  return (
    <Track>
      <Hero />
      <About />
      <Stack />
      <Work />
      <Services />
      <Skills />
      <Process />
      <Testimonials />
      <Contact />
      <Ending />
    </Track>
  );
}
