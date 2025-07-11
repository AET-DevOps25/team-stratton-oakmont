// Custom hook for managing course data with simple caching
import { useState, useEffect, useCallback } from "react";
import type { CourseDto, CourseSearchParams } from "../types/Course";
import { getAllCourses, searchCourses, filterCourses } from "../api/courses";

export const useCourses = () => {
  const [courses, setCourses] = useState<CourseDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchCourses = useCallback(
    async (forceRefresh = false) => {
      // If we have courses cached and not forcing refresh, don't fetch again
      if (courses && !forceRefresh) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [courses]
  );

  // Search courses
  const searchCoursesHandler = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchCourses(searchTerm);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter courses
  const filterCoursesHandler = useCallback(
    async (params: CourseSearchParams) => {
      try {
        setLoading(true);
        setError(null);
        const data = await filterCourses(params);
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load courses on mount only if not cached
  useEffect(() => {
    if (!courses) {
      setLoading(true);
      fetchCourses();
    }
  }, [courses, fetchCourses]);

  return {
    courses: courses || [],
    loading,
    error,
    fetchCourses: () => fetchCourses(true), // Force refresh when called manually
    searchCourses: searchCoursesHandler,
    filterCourses: filterCoursesHandler,
  };
};
