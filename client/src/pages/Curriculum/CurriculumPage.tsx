import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Search,
  School,
  MenuBook,
  FilterList,
  Sort,
  Computer,
  Analytics,
  People,
  Biotech,
  MenuBookOutlined,
} from "@mui/icons-material";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  language: string;
  professor: string;
  occurrence: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
  subSubcategory?: string;
}

interface CurriculumPageProps {}

const CurriculumPage: React.FC<CurriculumPageProps> = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<
    string | null
  >(null);

  // Table states
  const [orderBy, setOrderBy] = useState<keyof Course>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {}
  );

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [currentFilterColumn, setCurrentFilterColumn] = useState<string>("");
  const [sortMenuAnchor, setSortMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  // Enhanced mock data with the new structure
  const mockCourses: Course[] = [
    // Master Thesis
    {
      id: "mt1",
      name: "Master's Thesis in Information Systems",
      code: "IN2982",
      credits: 30,
      semester: "Any",
      language: "English",
      professor: "Various",
      occurrence: "Winter/Summer",
      description:
        "Independent research project culminating in a master's thesis",
      category: "Master Thesis",
    },

    // Mandatory Courses
    {
      id: "m1",
      name: "Advanced Programming",
      code: "IN0002",
      credits: 6,
      semester: "Winter",
      language: "English",
      professor: "Pretschner",
      occurrence: "Winter",
      description:
        "Advanced programming concepts and software engineering practices",
      prerequisites: ["Programming Fundamentals"],
      category: "Mandatory Courses",
    },
    {
      id: "m2",
      name: "Database Systems",
      code: "IN0007",
      credits: 6,
      semester: "Summer",
      language: "English",
      professor: "Kemper",
      occurrence: "Winter/Summer",
      description: "Design and implementation of database systems",
      prerequisites: ["Data Structures"],
      category: "Mandatory Courses",
    },
    {
      id: "m3",
      name: "Information Systems Architecture",
      code: "IN0015",
      credits: 9,
      semester: "Winter",
      language: "English",
      professor: "Krcmar",
      occurrence: "Winter",
      description: "Enterprise architecture and information systems design",
      category: "Mandatory Courses",
    },

    // Practical Courses
    {
      id: "p1",
      name: "Software Engineering Lab",
      code: "IN0012",
      credits: 5,
      semester: "Summer",
      language: "English",
      professor: "Pretschner",
      occurrence: "Summer",
      description: "Hands-on software development project",
      category: "Practical Courses",
    },
    {
      id: "p2",
      name: "Industry Internship",
      code: "IN0019",
      credits: 5,
      semester: "Any",
      language: "English",
      professor: "Various",
      occurrence: "Winter/Summer",
      description: "Professional internship in industry",
      category: "Practical Courses",
    },

    // Cross-Disciplinary Electives - Core Computer Science - Software Engineering
    {
      id: "se1",
      name: "Advanced Software Engineering",
      code: "IN0006",
      credits: 6,
      semester: "Winter",
      language: "English",
      professor: "Pretschner",
      occurrence: "Winter",
      description: "Modern software engineering methodologies and practices",
      category: "Cross-Disciplinary Electives",
      subcategory: "Core Computer Science",
      subSubcategory: "Software Engineering",
    },
    {
      id: "se2",
      name: "Software Testing and Quality Assurance",
      code: "IN0013",
      credits: 6,
      semester: "Summer",
      language: "English",
      professor: "Pretschner",
      occurrence: "Summer",
      description: "Comprehensive testing strategies and quality management",
      category: "Cross-Disciplinary Electives",
      subcategory: "Core Computer Science",
      subSubcategory: "Software Engineering",
    },

    // Cross-Disciplinary Electives - Data & Intelligence - Machine Learning
    {
      id: "ml1",
      name: "Introduction to Machine Learning",
      code: "IN2064",
      credits: 6,
      semester: "Winter",
      language: "English",
      professor: "Dai",
      occurrence: "Winter/Summer",
      description: "Fundamental machine learning algorithms and applications",
      prerequisites: ["Linear Algebra", "Statistics"],
      category: "Cross-Disciplinary Electives",
      subcategory: "Data & Intelligence",
      subSubcategory: "Machine Learning and Data Analysis",
    },
    {
      id: "ml2",
      name: "Deep Learning",
      code: "IN2346",
      credits: 6,
      semester: "Summer",
      language: "English",
      professor: "Dai",
      occurrence: "Summer",
      description: "Neural networks and deep learning architectures",
      prerequisites: ["Machine Learning"],
      category: "Cross-Disciplinary Electives",
      subcategory: "Data & Intelligence",
      subSubcategory: "Machine Learning and Data Analysis",
    },

    // Cross-Disciplinary Electives - Human & Systems Interaction - Management
    {
      id: "mgmt1",
      name: "IT Project Management",
      code: "WI000123",
      credits: 6,
      semester: "Winter",
      language: "English",
      professor: "Krcmar",
      occurrence: "Winter",
      description: "Managing information technology projects",
      category: "Cross-Disciplinary Electives",
      subcategory: "Human & Systems Interaction",
      subSubcategory: "Management",
    },

    // Cross-Disciplinary Electives - Specialized Domains - Computer Graphics
    {
      id: "cg1",
      name: "Computer Graphics",
      code: "IN2097",
      credits: 6,
      semester: "Winter",
      language: "English",
      professor: "Westermann",
      occurrence: "Winter",
      description: "Fundamentals of computer graphics and visualization",
      category: "Cross-Disciplinary Electives",
      subcategory: "Specialized Domains",
      subSubcategory: "Computer Graphics and Vision",
    },

    // Elective Modules in Interdisciplinary Fundamentals
    {
      id: "if1",
      name: "Ethics in Information Technology",
      code: "IN0014",
      credits: 3,
      semester: "Summer",
      language: "English",
      professor: "Broy",
      occurrence: "Summer",
      description: "Ethical considerations in IT development and deployment",
      category: "Elective Modules in Interdisciplinary Fundamentals",
    },
  ];

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
    } catch (err) {
      console.error("Error fetching curriculum:", err);
      setError("Failed to load curriculum. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.professor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filters
    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }
    if (selectedSubcategory) {
      filtered = filtered.filter(
        (course) => course.subcategory === selectedSubcategory
      );
    }
    if (selectedSubSubcategory) {
      filtered = filtered.filter(
        (course) => course.subSubcategory === selectedSubSubcategory
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((course) =>
          values.includes((course as any)[column])
        );
      }
    });

    setFilteredCourses(filtered);
  }, [
    courses,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    columnFilters,
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Master Thesis":
        return "#9c27b0";
      case "Mandatory Courses":
        return "#f44336";
      case "Practical Courses":
        return "#ff9800";
      case "Cross-Disciplinary Electives":
        return "#646cff";
      case "Elective Modules in Interdisciplinary Fundamentals":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getCategoryCredits = (category: string) => {
    switch (category) {
      case "Master Thesis":
        return 30;
      case "Mandatory Courses":
        return 21;
      case "Practical Courses":
        return 10;
      case "Cross-Disciplinary Electives":
        return 53;
      case "Elective Modules in Interdisciplinary Fundamentals":
        return 6;
      default:
        return 0;
    }
  };

  const handleCategoryFilter = (category: string) => {
    if (selectedCategory === category) {
      // Deselect if already selected
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
    }
  };

  const handleSort = (property: keyof Course) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedCourses = filteredCourses.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getUniqueValues = (column: keyof Course) => {
    return [...new Set(courses.map((course) => course[column]))]
      .filter((value) => value !== undefined && value !== null)
      .sort();
  };

  const handleFilterMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    column: string
  ) => {
    setFilterMenuAnchor(event.currentTarget);
    setCurrentFilterColumn(column);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
    setCurrentFilterColumn("");
  };

  const handleColumnFilterChange = (column: string, values: string[]) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: values,
    }));
  };

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
    setColumnFilters({});
    setSearchQuery("");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedSubcategory) count++;
    if (selectedSubSubcategory) count++;
    if (searchQuery) count++;
    count += Object.values(columnFilters).reduce(
      (acc, values) => acc + values.length,
      0
    );
    return count;
  };

  const subcategories = {
    "Cross-Disciplinary Electives": [
      "Core Computer Science",
      "Data & Intelligence",
      "Human & Systems Interaction",
      "Specialized Domains",
      "General",
    ],
  };

  const subSubcategories = {
    "Core Computer Science": [
      "Software Engineering",
      "Algorithms",
      "Computer Architecture, Networks, and Distributed Systems",
      "Formal Methods and their Applications",
      "Security and Data Protection",
    ],
    "Data & Intelligence": [
      "Machine Learning and Data Analysis",
      "Scientific Computing and High Performance Computing",
      "Databases and Information Systems",
    ],
    "Human & Systems Interaction": [
      "Human-Centered Engineering",
      "Information Systems",
      "Management",
    ],
    "Specialized Domains": [
      "Digital Biology and Digital Medicine",
      "Robotics",
      "Computer Graphics and Vision",
    ],
    General: ["Fundamentals Modules", "Modules without Classification"],
  };

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
        <CircularProgress sx={{ color: "#646cff" }} />
      </Box>
    );
  }

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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  const totalCredits = 120;
  const categories = [
    "Master Thesis",
    "Mandatory Courses",
    "Practical Courses",
    "Cross-Disciplinary Electives",
    "Elective Modules in Interdisciplinary Fundamentals",
  ];

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
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <MenuBook sx={{ mr: 2, fontSize: "2rem", color: "#646cff" }} />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              M.Sc. Information Systems
            </Typography>
          </Box>
        </Box>

        {/* Program Information */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Program Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Degree Type
              </Typography>
              <Typography variant="body1">Master</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Credits
              </Typography>
              <Typography variant="body1">120</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Duration
              </Typography>
              <Typography variant="body1">4 Semesters</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Main Location
              </Typography>
              <Typography variant="body1">Garching</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Possible Start
              </Typography>
              <Typography variant="body1">Winter/Summer</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Language
              </Typography>
              <Typography variant="body1">English</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Program Structure Overview */}
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
            Program Structure Overview
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={category}>
                <Card
                  sx={{
                    borderRadius: 3,
                    backgroundColor:
                      selectedCategory === category
                        ? getCategoryColor(category)
                        : "#333",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border:
                      selectedCategory === category
                        ? `2px solid ${getCategoryColor(category)}`
                        : "2px solid transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedCategory === category
                          ? getCategoryColor(category)
                          : "#444",
                      transform: "translateY(-2px)",
                      border: `2px solid ${getCategoryColor(category)}`,
                    },
                  }}
                  onClick={() => handleCategoryFilter(category)}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      {getCategoryCredits(category)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1 }}
                    >
                      ECTS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {category === "Mandatory Courses"
                        ? "Mandatory"
                        : category === "Practical Courses"
                        ? "Practical"
                        : category === "Cross-Disciplinary Electives"
                        ? "Electives"
                        : category ===
                          "Elective Modules in Interdisciplinary Fundamentals"
                        ? "Interdisciplinary Electives"
                        : category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Subcategory Selection for Cross-Disciplinary Electives */}
        {selectedCategory === "Cross-Disciplinary Electives" && (
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
              Elective Categories
            </Typography>
            <Grid container spacing={2}>
              {subcategories["Cross-Disciplinary Electives"].map((subcat) => {
                // Icon mapping for each category
                const getSubcategoryIcon = (subcategory: string) => {
                  switch (subcategory) {
                    case "Core Computer Science":
                      return (
                        <Computer
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                    case "Data & Intelligence":
                      return (
                        <Analytics
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                    case "Human & Systems Interaction":
                      return (
                        <People
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                    case "Specialized Domains":
                      return (
                        <Biotech
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                    case "General":
                      return (
                        <MenuBookOutlined
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                    default:
                      return (
                        <School
                          sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }}
                        />
                      );
                  }
                };

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={subcat}>
                    <Card
                      sx={{
                        backgroundColor:
                          selectedSubcategory === subcat ? "#646cff" : "#444",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        height: 120, // Fixed height for consistency
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
                        if (selectedSubcategory === subcat) {
                          setSelectedSubcategory(null);
                          setSelectedSubSubcategory(null);
                        } else {
                          setSelectedSubcategory(subcat);
                          setSelectedSubSubcategory(null);
                        }
                      }}
                    >
                      <CardContent
                        sx={{
                          textAlign: "center",
                          p: 2,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        {getSubcategoryIcon(subcat)}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            lineHeight: 1.2,
                            textAlign: "center",
                            minHeight: "2.4em", // Fixed minimum height for text
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {subcat}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* Sub-subcategory Selection */}
        {selectedSubcategory &&
          subSubcategories[
            selectedSubcategory as keyof typeof subSubcategories
          ] && (
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
                {selectedSubcategory} - Specific Areas
              </Typography>
              <Grid container spacing={2}>
                {subSubcategories[
                  selectedSubcategory as keyof typeof subSubcategories
                ].map((subSubcat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={subSubcat}>
                    <Card
                      sx={{
                        backgroundColor:
                          selectedSubSubcategory === subSubcat
                            ? "#646cff"
                            : "#555",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        height: 80, // Fixed height for consistency
                        display: "flex",
                        alignItems: "center",
                        "&:hover": {
                          backgroundColor:
                            selectedSubSubcategory === subSubcat
                              ? "#646cff"
                              : "#666",
                          transform: "translateY(-2px)",
                        },
                        borderRadius: 3,
                      }}
                      onClick={() => {
                        setSelectedSubSubcategory(
                          selectedSubSubcategory === subSubcat
                            ? null
                            : subSubcat
                        );
                      }}
                    >
                      <CardContent
                        sx={{
                          textAlign: "center",
                          p: 2,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            lineHeight: 1.2,
                            textAlign: "center",
                          }}
                        >
                          {subSubcat}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

        {/* Enhanced Search and Filter Bar */}
        <Box sx={{ mb: 3 }}>
          {/* Search Bar Row */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              placeholder="Search courses by name, code, category, or description..."
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
                  backgroundColor: "#2a2a2a",
                  borderRadius: 3,
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#646cff" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputBase-input": { color: "white" },
              }}
            />
            <IconButton sx={{ color: "#aaa" }} onClick={handleSortMenuOpen}>
              <Sort />
            </IconButton>
            <IconButton
              sx={{ color: getActiveFilterCount() > 0 ? "#646cff" : "#aaa" }}
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
            >
              <FilterList />
            </IconButton>
          </Box>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#aaa", mr: 1, alignSelf: "center" }}
              >
                Active filters:
              </Typography>
              {selectedCategory && (
                <Chip
                  label={`Category: ${selectedCategory}`}
                  onDelete={() => setSelectedCategory(null)}
                  size="small"
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {selectedSubcategory && (
                <Chip
                  label={`Sub: ${selectedSubcategory}`}
                  onDelete={() => setSelectedSubcategory(null)}
                  size="small"
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {selectedSubSubcategory && (
                <Chip
                  label={`Area: ${selectedSubSubcategory}`}
                  onDelete={() => setSelectedSubSubcategory(null)}
                  size="small"
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {Object.entries(columnFilters).map(([column, values]) =>
                values.map((value) => (
                  <Chip
                    key={`${column}-${value}`}
                    label={`${column}: ${value}`}
                    onDelete={() =>
                      handleColumnFilterChange(
                        column,
                        values.filter((v) => v !== value)
                      )
                    }
                    size="small"
                    sx={{ backgroundColor: "#ff9800", color: "white" }}
                  />
                ))
              )}
              <Chip
                label="Clear all"
                onClick={clearAllFilters}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#aaa", color: "#aaa" }}
              />
            </Box>
          )}
        </Box>

        {/* Courses Table */}
        <Paper
          sx={{ backgroundColor: "#2a2a2a", color: "white", borderRadius: 3 }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #444" }}>
            <Typography variant="h6">Courses</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleSort("name")}
                        sx={{ color: "white !important" }}
                      >
                        Name
                      </TableSortLabel>
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "name")}
                        sx={{
                          color:
                            columnFilters.name?.length > 0 ? "#646cff" : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TableSortLabel
                        active={orderBy === "code"}
                        direction={orderBy === "code" ? order : "asc"}
                        onClick={() => handleSort("code")}
                        sx={{ color: "white !important" }}
                      >
                        ID
                      </TableSortLabel>
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "code")}
                        sx={{
                          color:
                            columnFilters.code?.length > 0 ? "#646cff" : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Language
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "language")}
                        sx={{
                          color:
                            columnFilters.language?.length > 0
                              ? "#646cff"
                              : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TableSortLabel
                        active={orderBy === "credits"}
                        direction={orderBy === "credits" ? order : "asc"}
                        onClick={() => handleSort("credits")}
                        sx={{ color: "white !important" }}
                      >
                        ECTS
                      </TableSortLabel>
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "credits")}
                        sx={{
                          color:
                            columnFilters.credits?.length > 0
                              ? "#646cff"
                              : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Professor
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "professor")}
                        sx={{
                          color:
                            columnFilters.professor?.length > 0
                              ? "#646cff"
                              : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Occurrence
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "occurrence")}
                        sx={{
                          color:
                            columnFilters.occurrence?.length > 0
                              ? "#646cff"
                              : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Category
                      {/* <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, "category")}
                        sx={{
                          color:
                            columnFilters.category?.length > 0
                              ? "#646cff"
                              : "#aaa",
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCourses.map((course) => (
                  <TableRow
                    key={course.id}
                    sx={{
                      "&:hover": { backgroundColor: "#333" },
                      borderBottom: "1px solid #444",
                    }}
                  >
                    <TableCell sx={{ color: "white" }}>{course.name}</TableCell>
                    <TableCell sx={{ color: "white" }}>{course.code}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.language}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.credits}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.professor}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.occurrence}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={
                          course.category === "Mandatory Courses"
                            ? "Mandatory"
                            : course.category === "Practical Courses"
                            ? "Practical"
                            : course.category === "Cross-Disciplinary Electives"
                            ? "Electives"
                            : course.category ===
                              "Elective Modules in Interdisciplinary Fundamentals"
                            ? "Interdisciplinary"
                            : course.category
                        }
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(course.category),
                          color: "white",
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* No courses message */}
        {sortedCourses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <School sx={{ fontSize: "3rem", color: "#666", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              No courses found
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}

        {/* Column Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={handleFilterMenuClose}
          PaperProps={{
            sx: { backgroundColor: "#2a2a2a", color: "white", maxHeight: 300 },
          }}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Filter by {currentFilterColumn}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={columnFilters[currentFilterColumn] || []}
                onChange={(e) =>
                  handleColumnFilterChange(
                    currentFilterColumn,
                    e.target.value as string[]
                  )
                }
                renderValue={(selected) => `${selected.length} selected`}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                  "& .MuiSelect-select": { color: "white" },
                  "& .MuiSvgIcon-root": { color: "white" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#2a2a2a",
                      color: "white",
                      maxHeight: 200,
                    },
                  },
                }}
              >
                {getUniqueValues(currentFilterColumn as keyof Course).map(
                  (value) => (
                    <MenuItem key={String(value)} value={String(value)}>
                      <Checkbox
                        checked={(
                          columnFilters[currentFilterColumn] || []
                        ).includes(String(value))}
                        sx={{ color: "white" }}
                      />
                      <ListItemText primary={String(value)} />
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>
        </Menu>

        {/* Sort Menu */}
        <Menu
          anchorEl={sortMenuAnchor}
          open={Boolean(sortMenuAnchor)}
          onClose={handleSortMenuClose}
          PaperProps={{
            sx: { backgroundColor: "#2a2a2a", color: "white" },
          }}
        >
          <MenuItem
            onClick={() => {
              handleSort("name");
              handleSortMenuClose();
            }}
          >
            Sort by Name
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("code");
              handleSortMenuClose();
            }}
          >
            Sort by Code
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("credits");
              handleSortMenuClose();
            }}
          >
            Sort by ECTS
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("professor");
              handleSortMenuClose();
            }}
          >
            Sort by Professor
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default CurriculumPage;
