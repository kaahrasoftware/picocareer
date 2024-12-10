import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { CareerCard } from "@/components/CareerCard";
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const featuredCareers = [
  {
    title: "Cybersecurity Analyst",
    description: "Thrive in a cybersecurity career defending against online threats and securing information.",
    users: "72.3K",
    salary: "$75K - $110K",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    relatedMajors: ["Computer Science", "Information Technology", "Network Security"],
    relatedCareers: ["Security Engineer", "Network Administrator", "IT Consultant"],
    skills: ["Network Security", "Cryptography", "Risk Analysis", "Security Tools"],
  },
  {
    title: "Healthcare",
    description: "Healthcare fosters well-being through diverse services for individuals' physical and mental health needs.",
    users: "125.2M",
    salary: "$60K - $150K",
    imageUrl: "https://images.unsplash.com/photo-1584982751601-97dcc096659c",
    relatedMajors: ["Nursing", "Public Health", "Biology", "Pre-Med"],
    relatedCareers: ["Nurse", "Medical Doctor", "Healthcare Administrator"],
    skills: ["Patient Care", "Medical Knowledge", "Communication", "Empathy"],
  },
  {
    title: "Software Engineering",
    description: "Build innovative solutions and shape the digital future through code and creativity.",
    users: "754.8K",
    salary: "$90K - $120K",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    relatedMajors: ["Computer Science", "Software Engineering", "Information Systems"],
    relatedCareers: ["Full Stack Developer", "DevOps Engineer", "Mobile Developer"],
    skills: ["Programming", "Problem Solving", "System Design", "Algorithms"],
  },
  {
    title: "Accountant",
    description: "Guide financial success through expert analysis and strategic planning.",
    users: "432.1K",
    salary: "$65K - $95K",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c",
    relatedMajors: ["Accounting", "Finance", "Business Administration"],
    relatedCareers: ["Financial Analyst", "Tax Advisor", "Auditor"],
    skills: ["Financial Analysis", "Tax Laws", "Bookkeeping", "Business Acumen"],
  },
];

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-kahra-dark text-white">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
              <SearchBar />
            </header>

            {/* Hero Section */}
            <section className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-kahra-secondary to-kahra-primary bg-clip-text text-transparent">
                Welcome to Kahra!
              </h1>
              <Slides />
            </section>

            {/* Featured Careers */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Featured Careers</h2>
                <button 
                  onClick={() => setIsDialogOpen(true)}
                  className="text-kahra-primary hover:text-kahra-primary/80 transition-colors"
                >
                  View all
                </button>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  slidesToScroll: 3,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {featuredCareers.map((career, index) => (
                    <CarouselItem key={index} className="basis-1/3">
                      <CareerCard {...career} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </section>
          </div>
        </main>
        <ProfileSidebar />
        <CareerListDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          careers={featuredCareers}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;