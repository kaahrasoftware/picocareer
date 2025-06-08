
export const MentorProcessSection = () => {
  const processSteps = [
    {
      number: "1",
      title: "Complete Your Profile",
      description: "Share your expertise, experience, and availability with students"
    },
    {
      number: "2",
      title: "Set Your Preferences",
      description: "Choose your mentoring areas, availability, and session preferences"
    },
    {
      number: "3",
      title: "Start Mentoring",
      description: "Connect with motivated students and begin making an impact"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started as a mentor is quick and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {processSteps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
