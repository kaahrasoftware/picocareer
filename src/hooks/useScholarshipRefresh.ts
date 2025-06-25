
import { useState, useCallback } from "react";

export function useScholarshipRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshScholarships = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    refreshKey,
    refreshScholarships
  };
}
