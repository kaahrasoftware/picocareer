import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center mb-12 bg-[#2A2A2A] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMkEyQTJBIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] py-8">
        <h1 className="text-5xl font-bold mb-6 flex items-center justify-center text-white">
          <span className="bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent pt-3">
            Welcome to
          </span>
          <img 
            src="/lovable-uploads/65608658-2c3b-4eab-80f0-d9791cae7b50.png"
            alt="PicoCareer"
            className="h-20 ml-3"
          />
        </h1>
      </section>

      {/* Header */}
      <header className="flex justify-between items-center mb-16 relative bg-[#2A2A2A] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMkEyQTJBIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] py-12">
        <div className="w-full">
          <SearchBar placeholder="find mentor, academic programs, careers, universities, scholarships..." />
        </div>
      </header>

      <section className="mb-24">
        <Slides />
      </section>
    </>
  );
};