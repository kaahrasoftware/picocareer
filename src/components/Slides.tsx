import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

interface SlideContent {
  title: string;
  description: string;
  gradient: string;
}

const slides: SlideContent[] = [
  {
    title: "CAREER EXPLORATION",
    description:
      "Discover your path, fuel your ambitions, and build the future you envision with our comprehensive career directory.",
    gradient: "from-red-600/90 to-red-800/90",
  },
  {
    title: "1 ON 1 MENTORSHIP",
    description:
      "Unlock exclusive one-on-one sessions with expert mentors tailored to your individual queries, ensuring personalized guidance and invaluable insights.",
    gradient: "from-picocareer-primary/90 to-picocareer-dark/90",
  },
  {
    title: "MAJORS EXPLORATION",
    description:
      "Navigate through diverse academic paths, discover your interests, and make informed decisions about your educational journey.",
    gradient: "from-emerald-600/90 to-teal-800/90",
  },
];

export const Slides = () => {
  const plugin = useRef(
    Autoplay({ delay: 7000, stopOnInteraction: true })
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Explore Our Core Services</h2>
        <p className="text-gray-600 dark:text-gray-400">Discover the key features that make PicoCareer your ultimate career development companion.</p>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          skipSnaps: true,
        }}
        plugins={[plugin.current]}
        className="w-full max-w-4xl mx-auto"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/1">
              <div className={`h-full p-8 rounded-lg bg-gradient-to-br ${slide.gradient} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
                <h2 className="text-2xl font-bold mb-4 text-white text-center">{slide.title}</h2>
                <p className="text-white/90 text-lg leading-relaxed">{slide.description}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};