import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { CareerCard } from "@/components/CareerCard";
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

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