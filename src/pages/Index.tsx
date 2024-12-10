import { Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { CareerCard } from "@/components/CareerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const featuredCareers = [
  {
    title: "Cybersecurity Analyst",
    description: "Thrive in a cybersecurity career defending against online threats and securing information.",
    users: "72.3K Users",
    salary: "$75K - $110K",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  },
  {
    title: "Healthcare",
    description: "Healthcare fosters well-being through diverse services for individuals' physical and mental health needs.",
    users: "125.2M Users",
    salary: "$60K - $150K",
    imageUrl: "https://images.unsplash.com/photo-1584982751601-97dcc096659c",
  },
  {
    title: "Software Engineering",
    description: "The stars whispered secrets to the night, painting constellations across the velvet sky, each twinkling light a story waiting to be told.",
    users: "754.8K Users",
    salary: "$90K - $120K",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
];

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-kahra-dark text-white">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
              <SidebarTrigger />
              <div className="relative flex-1 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-4 pr-12 py-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 bg-transparent hover:bg-white/10"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-48">
                <SidebarTrigger />
              </div>
            </header>

            {/* Hero Section */}
            <section className="text-center mb-16 animate-float">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-kahra-secondary to-kahra-primary bg-clip-text text-transparent">
                Welcome to Kahra!
              </h1>
              <div className="max-w-2xl mx-auto p-8 rounded-lg bg-gradient-to-r from-kahra-secondary/20 to-kahra-primary/20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4">CAREER EXPLORATION</h2>
                <p className="text-gray-300">
                  Discover endless possibilities, unlock passions, and define your future through personalized guidance in our Career Exploration journey. Start today!
                </p>
              </div>
            </section>

            {/* Featured Careers */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Featured Careers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCareers.map((career) => (
                  <CareerCard key={career.title} {...career} />
                ))}
              </div>
            </section>
          </div>
        </main>
        <ProfileSidebar />
      </div>
    </SidebarProvider>
  );
};

export default Index;