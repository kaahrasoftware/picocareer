import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SlideContent {
  title: string;
  description: string;
  gradient: string;
}

const slides: SlideContent[] = [
  {
    title: "CAREER EXPLORATION",
    description:
      "Discover endless possibilities, unlock passions, and define your future through personalized guidance in our Career Exploration journey. Start today!",
    gradient: "from-red-600/90 to-red-800/90",
  },
  {
    title: "1 ON 1 MENTORSHIP",
    description:
      "Unlock exclusive one-on-one sessions with expert mentors tailored to your individual queries, ensuring personalized guidance and invaluable insights",
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
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
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
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};