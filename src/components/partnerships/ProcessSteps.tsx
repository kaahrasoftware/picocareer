export function ProcessSteps() {
  const steps = [{
    number: "01",
    title: "Submit Application",
    description: "Complete our comprehensive partnership application form with your organization details and goals."
  }, {
    number: "02",
    title: "Initial Review",
    description: "Our partnership team reviews your application and conducts preliminary compatibility assessment."
  }, {
    number: "03",
    title: "Discovery Call",
    description: "Schedule a detailed discussion to explore partnership opportunities and address questions."
  }, {
    number: "04",
    title: "Proposal Development",
    description: "We create a customized partnership proposal tailored to your specific needs and objectives."
  }, {
    number: "05",
    title: "Agreement & Onboarding",
    description: "Finalize partnership terms and begin the onboarding process with dedicated support."
  }];
  return <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Partnership Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined partnership process ensures a smooth journey from initial 
            application to successful collaboration.
          </p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-600 hidden lg:block"></div>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => <div key={index} className="relative text-center">
                <div className="relative z-10 bg-white p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 bg-sky-950">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
}