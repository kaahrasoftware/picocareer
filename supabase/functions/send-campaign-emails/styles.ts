
export function getContentTypeStyles(contentType: string) {
  const styles = {
    scholarships: {
      card: 'border-left: 4px solid #F6E05E;',
      title: 'Scholarship Opportunities',
    },
    opportunities: {
      card: 'border-left: 4px solid #68D391;',
      title: 'Career Opportunities',
    },
    careers: {
      card: 'border-left: 4px solid #4299E1;',
      title: 'Career Spotlight',
    },
    majors: {
      card: 'border-left: 4px solid #ED64A6;',
      title: 'Academic Major Recommendations',
    },
    schools: {
      card: 'border-left: 4px solid #9F7AEA;',
      title: 'School Recommendations',
    },
    mentors: {
      card: 'border-left: 4px solid #F687B3;',
      title: 'Meet Our Mentors',
    },
    blogs: {
      card: 'border-left: 4px solid #B794F4;',
      title: 'Latest Career Insights',
    },
  };

  const defaultStyle = {
    card: 'border-left: 4px solid #8B5CF6;',
    title: 'Personalized Recommendations',
  };

  const style = styles[contentType as keyof typeof styles] || defaultStyle;

  const contentTypeLabels = {
    scholarships: "Scholarships",
    opportunities: "Opportunities",
    careers: "Careers",
    majors: "Academic Majors",
    schools: "Schools",
    mentors: "Mentors",
    blogs: "Articles"
  };

  return {
    cardStyles: { card: style.card },
    headerStyles: { title: style.title },
    contentTypeLabel: contentTypeLabels[contentType as keyof typeof contentTypeLabels] || "Recommendations"
  };
}
