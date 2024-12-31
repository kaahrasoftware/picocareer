export const formatMajorData = (data: Record<string, any>) => {
  const arrayFields = [
    'learning_objectives',
    'common_courses',
    'interdisciplinary_connections',
    'certifications_to_consider',
    'degree_levels',
    'affiliated_programs',
    'transferable_skills',
    'tools_knowledge',
    'skill_match',
    'professional_associations',
    'common_difficulties',
    'career_opportunities',
    'majors_to_consider_switching_to'
  ];

  const formattedData = { ...data };
  
  // Convert string fields to arrays
  arrayFields.forEach(field => {
    if (formattedData[field]) {
      if (typeof formattedData[field] === 'string') {
        formattedData[field] = formattedData[field]
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean);
      } else if (!Array.isArray(formattedData[field])) {
        formattedData[field] = [];
      }
    } else {
      formattedData[field] = [];
    }
  });

  // Convert numeric fields
  if (formattedData.gpa_expectations) {
    formattedData.gpa_expectations = parseFloat(formattedData.gpa_expectations);
  }

  // Convert boolean fields
  if (typeof formattedData.featured === 'string') {
    formattedData.featured = formattedData.featured === 'true';
  }

  // Set default status
  formattedData.status = 'Pending';

  return formattedData;
};