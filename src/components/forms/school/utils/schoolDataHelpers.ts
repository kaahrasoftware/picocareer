
import type { School } from "@/types/database/schools";

/**
 * Safely constructs a location string from school data, handling null values
 */
export function safeConstructLocation(school: {
  location?: string | null;
  state?: string | null;
  country?: string | null;
}): string {
  try {
    // If location is already provided and not null/empty, use it
    if (school.location && typeof school.location === 'string' && school.location.trim()) {
      return school.location.trim();
    }

    // Build location from state and country, ensuring we handle null values safely
    const locationParts: string[] = [];
    
    if (school.state && typeof school.state === 'string' && school.state.trim()) {
      locationParts.push(school.state.trim());
    }
    
    if (school.country && typeof school.country === 'string' && school.country.trim()) {
      locationParts.push(school.country.trim());
    }

    // Join the parts or return default
    return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
  } catch (error) {
    console.warn('Error constructing school location:', error, school);
    return 'Location not specified';
  }
}

/**
 * Safely transforms raw school data to ensure all fields are properly typed
 */
export function safeTransformSchoolData(rawSchool: any): School {
  try {
    return {
      id: rawSchool.id || '',
      name: rawSchool.name || 'Unknown School',
      type: rawSchool.type || null,
      state: rawSchool.state || null,
      country: rawSchool.country || null,
      location: safeConstructLocation(rawSchool),
      status: rawSchool.status || 'Pending'
    } as School;
  } catch (error) {
    console.warn('Error transforming school data:', error, rawSchool);
    return {
      id: rawSchool?.id || '',
      name: 'Unknown School',
      type: null,
      state: null,
      country: null,
      location: 'Location not specified',
      status: 'Pending'
    } as School;
  }
}

/**
 * Safely processes an array of school data, filtering out invalid entries
 */
export function safeProcessSchoolArray(data: any[]): School[] {
  if (!Array.isArray(data)) {
    console.warn('Expected array for school data, got:', typeof data);
    return [];
  }

  return data
    .filter(item => item && typeof item === 'object' && item.id)
    .map(safeTransformSchoolData);
}
