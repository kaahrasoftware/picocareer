
export const MentorProcessSection = () => {
  const processSteps = [
    {
      number: "1",
      title: "Complete Your Profile",
      description: "Share your expertise, experience, and availability with students",
      gradient: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      number: "2", 
      title: "Set Your Preferences",
      description: "Choose your mentoring areas, availability, and session preferences",
      gradient: "from-purple-400 to-pink-400",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      number: "3",
      title: "Start Mentoring",
      description: "Connect with motivated students and begin making an impact",
      gradient: "from-green-400 to-emerald-400",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <section className="py-16 px-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started as a mentor is quick and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
          
          {processSteps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Circle */}
              <div className="relative mb-6 mx-auto">
                <div className={`bg-gradient-to-r ${step.gradient} w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 relative z-10`}>
                  {step.number}
                </div>
                
                {/* Pulsing Ring */}
                <div className={`absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r ${step.gradient} opacity-30 animate-pulse group-hover:opacity-50 transition-opacity duration-300 mx-auto`} />
                
                {/* Outer Ring */}
                <div className={`absolute -inset-2 w-24 h-24 rounded-full border-2 ${step.borderColor} group-hover:border-opacity-60 transition-all duration-300 mx-auto`} />
              </div>
              
              {/* Content Card */}
              <div className={`${step.bgColor} rounded-xl p-6 ${step.borderColor} border group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-muted-foreground relative z-10 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
