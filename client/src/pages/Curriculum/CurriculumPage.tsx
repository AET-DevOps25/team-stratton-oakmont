import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Collapse,
  Divider,
  LinearProgress,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import {
  MenuBook,
  Search,
  ExpandMore,
  ExpandLess,
  FilterList,
  Clear,
  School,
  Schedule,
  Language,
  Person,
  Assignment,
  Info,
  CheckCircle,
  AccessTime,
  WbSunny,
  AcUnit,
  CalendarToday,
  Close,
} from "@mui/icons-material";

// Import our API
import {
  moduleDetailsAPI,
  type Course,
  type CurriculumOverviewDto,
  type CategoryStatisticsDto,
  type ModuleDetails,
} from "../../api/moduleDetails";

interface CurriculumPageProps {}

const CurriculumPage: React.FC<CurriculumPageProps> = () => {
  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [curriculumOverview, setCurriculumOverview] =
    useState<CurriculumOverviewDto | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatisticsDto[]>(
    []
  );

  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
    null
  );
  const [selectedCreditsRange, setSelectedCreditsRange] = useState<
    string | null
  >(null);

  // Advanced UI states
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<ModuleDetails | null>(
    null
  );
  const [courseDetailsOpen, setCourseDetailsOpen] = useState<boolean>(false);

  // Available filter options
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableOccurrences, setAvailableOccurrences] = useState<string[]>(
    []
  );

  // Configuration
  const STUDY_PROGRAM_ID = 121; // M.Sc. Information Systems

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12); // 12 courses per page
  const [paginatedCourses, setPaginatedCourses] = useState<Course[]>([]);

  // Debounce search query to prevent API spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial data
  const fetchCurriculumData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, stats, languages, occurrences] = await Promise.all([
        moduleDetailsAPI.getCurriculumOverview(STUDY_PROGRAM_ID),
        moduleDetailsAPI.getCategoryStatistics(STUDY_PROGRAM_ID),
        moduleDetailsAPI.getDistinctLanguages(STUDY_PROGRAM_ID),
        moduleDetailsAPI.getDistinctOccurrences(STUDY_PROGRAM_ID),
      ]);

      setCurriculumOverview(overview);
      setCategoryStats(stats);
      setAvailableLanguages(languages);
      setAvailableOccurrences(occurrences);

      // Convert all modules from categories to courses
      const allCourses: Course[] = [];
      stats.forEach((categoryData) => {
        categoryData.modules.forEach((module) => {
          allCourses.push(
            moduleDetailsAPI.convertModuleSummaryToCourse(module)
          );
        });
      });

      setCourses(allCourses);
      setFilteredCourses(allCourses);
    } catch (err) {
      console.error("Error fetching curriculum data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load curriculum data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories when category changes
  const fetchSubcategories = async (category: string) => {
    try {
      const subcategories = await moduleDetailsAPI.getDistinctSubcategories(
        STUDY_PROGRAM_ID,
        category
      );
      setAvailableSubcategories(subcategories);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setAvailableSubcategories([]);
    }
  };

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  // Advanced filtering with debounced search
  useEffect(() => {
    const applyFilters = async () => {
      if (!curriculumOverview) return;

      try {
        let filteredCourses: Course[] = [];

        // Check if we have any active filters
        const hasFilters =
          selectedCategory ||
          selectedSubcategory ||
          selectedLanguage ||
          selectedOccurrence ||
          selectedCreditsRange ||
          debouncedSearchQuery;

        if (hasFilters) {
          // Parse credits range
          let minCredits: number | undefined;
          let maxCredits: number | undefined;
          if (selectedCreditsRange) {
            const [min, max] = selectedCreditsRange.split("-").map(Number);
            minCredits = min;
            maxCredits = max;
          }

          const filters = {
            category: selectedCategory || undefined,
            subcategory: selectedSubcategory || undefined,
            language: selectedLanguage || undefined,
            occurrence: selectedOccurrence || undefined,
            minCredits,
            maxCredits,
            searchTerm: debouncedSearchQuery || undefined,
          };

          const modules = await moduleDetailsAPI.advancedSearch(
            STUDY_PROGRAM_ID,
            filters
          );
          filteredCourses = modules.map((module) =>
            moduleDetailsAPI.convertModuleDetailsToCourse(module)
          );
        } else {
          // No filters, show all courses
          filteredCourses = courses;
        }

        setFilteredCourses(filteredCourses);
      } catch (err) {
        console.error("Error applying filters:", err);
        // Fallback to showing all courses
        setFilteredCourses(courses);
      }
    };

    applyFilters();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedLanguage,
    selectedOccurrence,
    selectedCreditsRange,
    debouncedSearchQuery, // Use debounced version
    courses,
    curriculumOverview,
  ]);

  // Memoized Course Card Component for better performance
  const CourseCard = React.memo(({ course }: { course: Course }) => (
    <Card
      sx={{
        backgroundColor: "#2a2a2a",
        borderLeft: `6px solid ${getCategoryColor(course.category)}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#333",
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px rgba(${getCategoryColor(course.category)
            .slice(1)
            .match(/.{2}/g)
            ?.map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.2)`,
        },
      }}
      onClick={() => handleCourseClick(course)}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Course Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: "white", mb: 1, fontWeight: 600 }}
            >
              {course.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#646cff", mb: 1, fontWeight: 500 }}
            >
              {course.code}
            </Typography>
          </Box>
          <Chip
            label={`${course.credits} ECTS`}
            sx={{
              backgroundColor: getCategoryColor(course.category),
              color: "white",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          />
        </Box>

        {/* Course Tags */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={course.category.replace(
              "Required Modules Information Systems",
              "Required IS"
            )}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(course.category),
              color: "white",
              fontWeight: 500,
            }}
          />
          {course.subcategory && (
            <Chip
              label={course.subcategory}
              size="small"
              sx={{ backgroundColor: "#666", color: "white" }}
            />
          )}

          {/* Semester availability badge */}
          <Chip
            icon={getSemesterIcon(course.occurrence)}
            label={course.occurrence}
            size="small"
            sx={{
              backgroundColor: getSemesterColor(course.occurrence),
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />

          {/* Language badge */}
          <Chip
            icon={<Language />}
            label={course.language}
            size="small"
            sx={{
              backgroundColor: "#666",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        </Box>

        {/* Professor */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Person sx={{ fontSize: "1rem", color: "#aaa" }} />
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            <strong>Professor:</strong> {course.professor}
          </Typography>
        </Box>

        {/* Description */}
        {course.description && (
          <Typography
            variant="body2"
            sx={{ color: "#ccc", lineHeight: 1.5, mb: 2 }}
          >
            {course.description.length > 180
              ? `${course.description.substring(0, 180)}...`
              : course.description}
          </Typography>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#ff9800",
                fontWeight: 600,
                display: "block",
                mb: 1,
              }}
            >
              Prerequisites:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {course.prerequisites.slice(0, 3).map((prereq, index) => (
                <Chip
                  key={index}
                  label={prereq}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.2)",
                    color: "#ff9800",
                    border: "1px solid #ff9800",
                  }}
                />
              ))}
              {course.prerequisites.length > 3 && (
                <Chip
                  label={`+${course.prerequisites.length - 3} more`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    color: "#ff9800",
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Click to view more indicator */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
            gap: 1,
            color: "#646cff",
            opacity: 0.7,
          }}
        >
          <Info sx={{ fontSize: "1rem" }} />
          <Typography variant="caption">
            Click for detailed information
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ));

  // useEffect for pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCourses = filteredCourses.slice(startIndex, endIndex);
    setPaginatedCourses(currentPageCourses);
  }, [filteredCourses, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedLanguage,
    selectedOccurrence,
    selectedCreditsRange,
    debouncedSearchQuery,
  ]);

  // Helper functions
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Master's Thesis":
        return "#9c27b0";
      case "Required Modules":
        return "#f44336";
      case "Practical Lab":
        return "#ff9800";
      case "Support Electives":
        return "#646cff";
      case "Elective Courses":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getCategoryCreditsStatic = (category: string) => {
    switch (category) {
      case "Master's Thesis":
        return 30;
      case "Required Modules":
        return 21;
      case "Practical Lab":
        return 10;
      case "Support Electives":
        return 6;
      case "Elective Courses":
        return 53;
      default:
        return 0;
    }
  };

  const getCategoryCredits = (category: string) => {
    const categoryData = categoryStats.find(
      (stat) => stat.category === category
    );
    return categoryData ? categoryData.totalCredits : 0;
  };

  const getCategoryModuleCount = (category: string) => {
    const categoryData = categoryStats.find(
      (stat) => stat.category === category
    );
    return categoryData ? categoryData.moduleCount : 0;
  };

  const getSemesterIcon = (occurrence: string) => {
    const lowerOccurrence = occurrence.toLowerCase();
    if (
      lowerOccurrence.includes("winter") &&
      lowerOccurrence.includes("summer")
    ) {
      return <CalendarToday sx={{ fontSize: "1rem" }} />;
    } else if (lowerOccurrence.includes("winter")) {
      return <AcUnit sx={{ fontSize: "1rem" }} />;
    } else if (lowerOccurrence.includes("summer")) {
      return <WbSunny sx={{ fontSize: "1rem" }} />;
    }
    return <Schedule sx={{ fontSize: "1rem" }} />;
  };

  const getSemesterColor = (occurrence: string) => {
    const lowerOccurrence = occurrence.toLowerCase();
    if (
      lowerOccurrence.includes("winter") &&
      lowerOccurrence.includes("summer")
    ) {
      return "#4caf50"; // Green for both semesters
    } else if (lowerOccurrence.includes("winter")) {
      return "#2196f3"; // Blue for winter
    } else if (lowerOccurrence.includes("summer")) {
      return "#ff9800"; // Orange for summer
    }
    return "#757575"; // Gray for unclear
  };

  const getCreditsRangeOptions = () => {
    return ["1-3", "4-6", "7-9", "10-15", "16-30"];
  };

  // Event handlers
  const handleCategoryFilter = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleCourseClick = async (course: Course) => {
    try {
      const moduleDetails = await moduleDetailsAPI.getModuleDetailsByModuleId(
        course.code
      );
      if (moduleDetails) {
        setSelectedCourse(moduleDetails);
        setCourseDetailsOpen(true);
      }
    } catch (err) {
      console.error("Error fetching module details:", err);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
    setSelectedOccurrence(null);
    setSelectedCreditsRange(null);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedSubcategory) count++;
    if (selectedLanguage) count++;
    if (selectedOccurrence) count++;
    if (selectedCreditsRange) count++;
    if (searchQuery) count++;
    return count;
  };

  const categories = categoryStats.map((stat) => stat.category);

  // pagination helper functions
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    // Smooth scroll to top of course list
    const courseListElement = document.getElementById("course-list-section");
    if (courseListElement) {
      courseListElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Memoized calculations for performance
  const programStatistics = useMemo(() => {
    if (!curriculumOverview) return null;

    const totalAvailableCredits = categoryStats.reduce(
      (sum, cat) => sum + cat.totalCredits,
      0
    );
    const totalAvailableModules = categoryStats.reduce(
      (sum, cat) => sum + cat.moduleCount,
      0
    );

    return {
      totalAvailableCredits,
      totalAvailableModules,
      requiredCredits: 120, // Typical Master's requirement
      completion: (120 / totalAvailableCredits) * 100,
    };
  }, [curriculumOverview, categoryStats]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1a1a1a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#646cff", mb: 2 }} />
          <Typography variant="h6">Loading curriculum data...</Typography>
          <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
            Fetching the latest course information
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1a1a1a",
          color: "white",
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "#2a1a1a",
              color: "white",
              "& .MuiAlert-icon": { color: "#f44336" },
            }}
            action={
              <Button color="inherit" onClick={fetchCurriculumData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
        p: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Header with Program Stats */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <MenuBook sx={{ mr: 2, fontSize: "2rem", color: "#646cff" }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {curriculumOverview?.programName || "M.Sc. Information Systems"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#aaa", fontStyle: "italic" }}
              >
                Technical University of Munich
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats Cards */}
          {programStatistics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
                  <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                    <School
                      sx={{ fontSize: "1.5rem", color: "#646cff", mb: 0.5 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {programStatistics.totalAvailableModules}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Available Modules
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
                  <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                    <Assignment
                      sx={{ fontSize: "1.5rem", color: "#4caf50", mb: 0.5 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {programStatistics.totalAvailableCredits}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Total ECTS Available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
                  <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                    <CheckCircle
                      sx={{ fontSize: "1.5rem", color: "#ff9800", mb: 0.5 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      120
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Required ECTS
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
                  <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                    <AccessTime
                      sx={{ fontSize: "1.5rem", color: "#9c27b0", mb: 0.5 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      4-6
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Semesters
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Program Structure Overview with Enhanced Categories */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Program Structure Overview
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => {
              const categoryCredits = getCategoryCreditsStatic(category);
              const moduleCount = getCategoryModuleCount(category);
              const isSelected = selectedCategory === category;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={category}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isSelected
                        ? getCategoryColor(category)
                        : "#333",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: isSelected
                        ? `3px solid ${getCategoryColor(category)}`
                        : "3px solid transparent",
                      "&:hover": {
                        backgroundColor: isSelected
                          ? getCategoryColor(category)
                          : "#404040",
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(${getCategoryColor(category)
                          .slice(1)
                          .match(/.{2}/g)
                          ?.map((hex) => parseInt(hex, 16))
                          .join(", ")}, 0.3)`,
                      },
                    }}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {categoryCredits}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mb: 2, opacity: 0.8 }}
                      >
                        ECTS Credits
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {category.length > 30
                          ? category
                              .replace(
                                "Required Modules Information Systems",
                                "Required IS Modules"
                              )
                              .replace(
                                "Elective Modules in Interdisciplinary Fundamentals",
                                "Interdisciplinary Electives"
                              )
                          : category}
                      </Typography>

                      <Chip
                        icon={<School />}
                        label={`${moduleCount} modules`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Subcategory Selection */}
        {selectedCategory && availableSubcategories.length > 0 && (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: "#2a2a2a",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              {selectedCategory} - Subcategories
            </Typography>
            <Grid container spacing={2}>
              {availableSubcategories.map((subcat) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={subcat}>
                  <Card
                    sx={{
                      backgroundColor:
                        selectedSubcategory === subcat ? "#646cff" : "#444",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor:
                          selectedSubcategory === subcat ? "#646cff" : "#555",
                        transform: "translateY(-2px)",
                      },
                      borderRadius: 3,
                    }}
                    onClick={() => {
                      setSelectedSubcategory(
                        selectedSubcategory === subcat ? null : subcat
                      );
                    }}
                  >
                    <CardContent
                      sx={{ textAlign: "center", p: 2, width: "100%" }}
                    >
                      <School
                        sx={{ fontSize: "1.5rem", color: "#646cff", mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subcat}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Enhanced Search and Filter Section */}
        <Paper
          sx={{
            backgroundColor: "#2a2a2a",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Main Search Bar */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <TextField
                placeholder="Search courses by name, code, professor, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#333",
                    borderRadius: 3,
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: "#646cff" },
                    "&.Mui-focused fieldset": { borderColor: "#646cff" },
                  },
                  "& .MuiInputBase-input": { color: "white" },
                }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                sx={{
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#646cff",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                Filters ({getActiveFilterCount()})
              </Button>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  sx={{
                    borderColor: "#f44336",
                    color: "#f44336",
                    "&:hover": {
                      borderColor: "#f44336",
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Advanced Filters */}
            <Collapse in={filtersExpanded}>
              <Box sx={{ pt: 2, borderTop: "1px solid #444" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#646cff" }}>
                  Advanced Filters
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: "#aaa" }}>Language</InputLabel>
                      <Select
                        value={selectedLanguage || ""}
                        onChange={(e) =>
                          setSelectedLanguage(e.target.value || null)
                        }
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#555",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                        }}
                      >
                        <MenuItem value="">All Languages</MenuItem>
                        {availableLanguages.map((language) => (
                          <MenuItem key={language} value={language}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Language sx={{ fontSize: "1rem" }} />
                              {language}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: "#aaa" }}>Semester</InputLabel>
                      <Select
                        value={selectedOccurrence || ""}
                        onChange={(e) =>
                          setSelectedOccurrence(e.target.value || null)
                        }
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#555",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                        }}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {availableOccurrences.map((occurrence) => (
                          <MenuItem key={occurrence} value={occurrence}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {getSemesterIcon(occurrence)}
                              {occurrence}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: "#aaa" }}>
                        Credits Range
                      </InputLabel>
                      <Select
                        value={selectedCreditsRange || ""}
                        onChange={(e) =>
                          setSelectedCreditsRange(e.target.value || null)
                        }
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#555",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#646cff",
                          },
                        }}
                      >
                        <MenuItem value="">All Credits</MenuItem>
                        {getCreditsRangeOptions().map((range) => (
                          <MenuItem key={range} value={range}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Assignment sx={{ fontSize: "1rem" }} />
                              {range} ECTS
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>

            {/* Active Filter Chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
              {selectedCategory && (
                <Chip
                  label={`Category: ${selectedCategory.replace(
                    "Required Modules Information Systems",
                    "Required IS"
                  )}`}
                  onDelete={() => setSelectedCategory(null)}
                  sx={{
                    backgroundColor: getCategoryColor(selectedCategory),
                    color: "white",
                  }}
                />
              )}
              {selectedSubcategory && (
                <Chip
                  label={`Subcategory: ${selectedSubcategory}`}
                  onDelete={() => setSelectedSubcategory(null)}
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {selectedLanguage && (
                <Chip
                  icon={<Language />}
                  label={selectedLanguage}
                  onDelete={() => setSelectedLanguage(null)}
                  sx={{ backgroundColor: "#4caf50", color: "white" }}
                />
              )}
              {selectedOccurrence && (
                <Chip
                  icon={getSemesterIcon(selectedOccurrence)}
                  label={selectedOccurrence}
                  onDelete={() => setSelectedOccurrence(null)}
                  sx={{
                    backgroundColor: getSemesterColor(selectedOccurrence),
                    color: "white",
                  }}
                />
              )}
              {selectedCreditsRange && (
                <Chip
                  icon={<Assignment />}
                  label={`${selectedCreditsRange} ECTS`}
                  onDelete={() => setSelectedCreditsRange(null)}
                  sx={{ backgroundColor: "#ff9800", color: "white" }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Results Summary */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: "#2a2a2a",
            borderRadius: 3,
          }}
          id="course-list-section" // Add this ID for smooth scrolling
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                Search Results
              </Typography>
              <Typography variant="body1" sx={{ color: "#aaa" }}>
                Showing{" "}
                <strong style={{ color: "#646cff" }}>
                  {(currentPage - 1) * itemsPerPage + 1}
                </strong>
                -
                <strong style={{ color: "#646cff" }}>
                  {Math.min(currentPage * itemsPerPage, filteredCourses.length)}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "#646cff" }}>
                  {filteredCourses.length}
                </strong>{" "}
                modules
                {filteredCourses.length !== courses.length && (
                  <span> (filtered from {courses.length} total)</span>
                )}
                {selectedCategory && (
                  <span>
                    {" "}
                    in{" "}
                    <strong
                      style={{ color: getCategoryColor(selectedCategory) }}
                    >
                      {selectedCategory.replace(
                        "Required Modules Information Systems",
                        "Required IS Modules"
                      )}
                    </strong>
                  </span>
                )}
                {searchQuery && (
                  <span>
                    {" "}
                    matching "
                    <strong style={{ color: "#646cff" }}>{searchQuery}</strong>"
                  </span>
                )}
              </Typography>
            </Box>

            {/* Search indicator */}
            {searchQuery !== debouncedSearchQuery && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#646cff",
                }}
              >
                <CircularProgress size={16} sx={{ color: "#646cff" }} />
                <Typography variant="caption">Searching...</Typography>
              </Box>
            )}
          </Box>

          {/* Page info for mobile */}
          {totalPages > 1 && (
            <Box sx={{ mt: 2, display: { xs: "block", sm: "none" } }}>
              <Typography
                variant="body2"
                sx={{ color: "#646cff", textAlign: "center" }}
              >
                Page {currentPage} of {totalPages}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Enhanced Course List */}
        <Box>
          {filteredCourses.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                backgroundColor: "#2a2a2a",
                borderRadius: 3,
              }}
            >
              <School sx={{ fontSize: "4rem", color: "#666", mb: 2 }} />
              <Typography variant="h5" sx={{ color: "#aaa", mb: 2 }}>
                No modules found
              </Typography>
              <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
                Try adjusting your search criteria or filters to find more
                courses
              </Typography>
              <Button
                variant="outlined"
                onClick={clearAllFilters}
                sx={{
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#646cff",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {paginatedCourses.map((course) => (
                <Grid size={{ xs: 12, lg: 6 }} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination Controls */}
          {filteredCourses.length > 0 && totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 4,
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "white",
                    borderColor: "#555",
                    "&:hover": {
                      backgroundColor: "rgba(100, 108, 255, 0.1)",
                      borderColor: "#646cff",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#646cff",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#535bf2",
                      },
                    },
                  },
                }}
              />

              {/* Results info for larger screens */}
              <Typography
                variant="body2"
                sx={{
                  color: "#aaa",
                  display: { xs: "none", sm: "block" },
                  ml: 2,
                }}
              >
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredCourses.length)}{" "}
                of {filteredCourses.length}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Course Details Modal */}
        <Dialog
          open={courseDetailsOpen}
          onClose={() => setCourseDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "#1a1a1a",
              color: "white",
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              borderBottom: "1px solid #444",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedCourse?.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={selectedCourse?.moduleId}
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
                <Chip
                  label={`${selectedCourse?.credits} ECTS`}
                  sx={{ backgroundColor: "#4caf50", color: "white" }}
                />
              </Box>
            </Box>
            <IconButton
              onClick={() => setCourseDetailsOpen(false)}
              sx={{ color: "#aaa" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {selectedCourse && (
              <Box sx={{ p: 3 }}>
                {/* Quick Info Grid */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#aaa", mb: 1 }}
                      >
                        Responsible
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.responsible}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#aaa", mb: 1 }}
                      >
                        Organisation
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.organisation || "TUM"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#aaa", mb: 1 }}
                      >
                        Level
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.moduleLevel || "Master"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#aaa", mb: 1 }}
                      >
                        Language
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.language}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Workload Information */}
                {(selectedCourse.totalHours ||
                  selectedCourse.contactHours ||
                  selectedCourse.selfStudyHours) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#646cff" }}>
                      Workload
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedCourse.totalHours && (
                        <Grid size={{ xs: 4 }}>
                          <Box
                            sx={{
                              textAlign: "center",
                              p: 2,
                              backgroundColor: "#2a2a2a",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", color: "#646cff" }}
                            >
                              {selectedCourse.totalHours}h
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#aaa" }}
                            >
                              Total Hours
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {selectedCourse.contactHours && (
                        <Grid size={{ xs: 4 }}>
                          <Box
                            sx={{
                              textAlign: "center",
                              p: 2,
                              backgroundColor: "#2a2a2a",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", color: "#4caf50" }}
                            >
                              {selectedCourse.contactHours}h
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#aaa" }}
                            >
                              Contact Hours
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {selectedCourse.selfStudyHours && (
                        <Grid size={{ xs: 4 }}>
                          <Box
                            sx={{
                              textAlign: "center",
                              p: 2,
                              backgroundColor: "#2a2a2a",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", color: "#ff9800" }}
                            >
                              {selectedCourse.selfStudyHours}h
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#aaa" }}
                            >
                              Self Study
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                {/* Detailed Information Sections */}
                <Box
                  sx={{
                    "& .MuiAccordion-root": {
                      backgroundColor: "#2a2a2a",
                      color: "white",
                      mb: 1,
                    },
                  }}
                >
                  {selectedCourse.intendedLearningOutcomes && (
                    <Accordion defaultExpanded>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Learning Outcomes</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.intendedLearningOutcomes}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.content && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Course Content</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.content}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.teachingAndLearningMethods && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Teaching Methods</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.teachingAndLearningMethods}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.descriptionOfAchievementAndAssessmentMethods && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Assessment Methods</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {
                            selectedCourse.descriptionOfAchievementAndAssessmentMethods
                          }
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.prerequisitesRecommended && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Prerequisites</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.prerequisitesRecommended}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.readingList && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Reading List</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.readingList}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {selectedCourse.media && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                      >
                        <Typography variant="h6">Media & Resources</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedCourse.media}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CurriculumPage;
