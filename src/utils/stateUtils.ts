
// Map of US state names to their abbreviations
export const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL", 
  "Alaska": "AK", 
  "Arizona": "AZ", 
  "Arkansas": "AR", 
  "California": "CA", 
  "Colorado": "CO", 
  "Connecticut": "CT", 
  "Delaware": "DE", 
  "Florida": "FL", 
  "Georgia": "GA", 
  "Hawaii": "HI", 
  "Idaho": "ID", 
  "Illinois": "IL", 
  "Indiana": "IN", 
  "Iowa": "IA", 
  "Kansas": "KS", 
  "Kentucky": "KY", 
  "Louisiana": "LA", 
  "Maine": "ME", 
  "Maryland": "MD", 
  "Massachusetts": "MA", 
  "Michigan": "MI", 
  "Minnesota": "MN", 
  "Mississippi": "MS", 
  "Missouri": "MO", 
  "Montana": "MT", 
  "Nebraska": "NE", 
  "Nevada": "NV", 
  "New Hampshire": "NH", 
  "New Jersey": "NJ", 
  "New Mexico": "NM", 
  "New York": "NY", 
  "North Carolina": "NC", 
  "North Dakota": "ND", 
  "Ohio": "OH", 
  "Oklahoma": "OK", 
  "Oregon": "OR", 
  "Pennsylvania": "PA", 
  "Rhode Island": "RI", 
  "South Carolina": "SC", 
  "South Dakota": "SD", 
  "Tennessee": "TN", 
  "Texas": "TX", 
  "Utah": "UT", 
  "Vermont": "VT", 
  "Virginia": "VA", 
  "Washington": "WA", 
  "West Virginia": "WV", 
  "Wisconsin": "WI", 
  "Wyoming": "WY", 
  "District of Columbia": "DC", 
  "Puerto Rico": "PR", 
  "American Samoa": "AS", 
  "Guam": "GU", 
  "Northern Mariana Islands": "MP", 
  "U.S. Virgin Islands": "VI"
};

/**
 * Returns the abbreviation for a US state
 * @param stateName The full name of the state
 * @returns The state abbreviation or empty string if not found
 */
export const getStateAbbreviation = (stateName: string): string => {
  return STATE_ABBREVIATIONS[stateName] || "";
};

/**
 * Converts a state name to the database format (State Name - XX)
 * @param state The state name to convert
 * @returns Formatted state string for database
 */
export const mapStateToDbFormat = (state: string): string => {
  // If state has format "State Name - XX" or is empty, return as-is
  if (!state || state.includes(" - ")) {
    return state;
  }
  
  // For US states, append the abbreviation
  const stateAbbr = getStateAbbreviation(state);
  if (stateAbbr) {
    return `${state} - ${stateAbbr}`;
  }
  
  // For non-US states/provinces, just return the name
  return state;
};

/**
 * Converts a database state format to UI display format
 * @param dbState The state value from the database
 * @returns UI-friendly state name
 */
export const mapDbStateToUiFormat = (dbState: string): string => {
  if (!dbState) return "";
  
  // If state has format "State Name - XX", return just the state name
  if (dbState.includes(" - ")) {
    return dbState.split(" - ")[0];
  }
  
  return dbState;
};
