import React from "react";

export const StatisticsSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Our Impact in Numbers</h2>
        <p className="text-muted-foreground">Discover how we're making a difference in education and career development.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <h3 className="text-4xl font-bold">500+</h3>
          <p className="text-muted-foreground">Mentors Available</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-4xl font-bold">1000+</h3>
          <p className="text-muted-foreground">Students Enrolled</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-4xl font-bold">200+</h3>
          <p className="text-muted-foreground">Career Paths Explored</p>
        </div>
      </div>
    </section>
  );
};
