
-- Function to update career profiles count
CREATE OR REPLACE FUNCTION public.update_career_profiles_count()
RETURNS TABLE (career_id uuid, count bigint) AS $$
BEGIN
    -- Update the profiles_count for each career based on mentor specializations
    UPDATE public.careers c
    SET profiles_count = subquery.count
    FROM (
        SELECT 
            ms.career_id, 
            COUNT(DISTINCT ms.profile_id) as count
        FROM 
            public.mentor_specializations ms
        GROUP BY 
            ms.career_id
    ) as subquery
    WHERE c.id = subquery.career_id;
    
    -- Return the updated counts
    RETURN QUERY
    SELECT c.id, c.profiles_count::bigint
    FROM public.careers c;
END;
$$ LANGUAGE plpgsql;

-- Function to update major profiles count
CREATE OR REPLACE FUNCTION public.update_major_profiles_count()
RETURNS TABLE (major_id uuid, count bigint) AS $$
BEGIN
    -- Update the profiles_count for each major based on mentor specializations
    UPDATE public.majors m
    SET profiles_count = subquery.count
    FROM (
        SELECT 
            ms.major_id, 
            COUNT(DISTINCT ms.profile_id) as count
        FROM 
            public.mentor_specializations ms
        GROUP BY 
            ms.major_id
    ) as subquery
    WHERE m.id = subquery.major_id;
    
    -- Return the updated counts
    RETURN QUERY
    SELECT m.id, m.profiles_count::bigint
    FROM public.majors m;
END;
$$ LANGUAGE plpgsql;
