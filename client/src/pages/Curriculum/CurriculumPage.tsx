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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { Search, School, MenuBook, ExpandMore } from "@mui/icons-material";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
}

interface CurriculumPageProps {}

const CurriculumPage: React.FC<CurriculumPageProps> = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Cross-Disciplinary Electives",
  ]);

  // Enhanced mock data with proper TUM Information Systems structure
  const mockCourses: Course[] = [
    // Master Thesis
    {
      id: "mt1",
      name: "Master's Thesis in Information Systems",
      code: "IN2982",
      credits: 30,
      semester: "Any",
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
      description: "Hands-on software development project",
      category: "Practical Courses",
    },
    {
      id: "p2",
      name: "Industry Internship",
      code: "IN0019",
      credits: 5,
      semester: "Any",
      description: "Professional internship in industry",
      category: "Practical Courses",
    },

    // Cross-Disciplinary Electives - Software Engineering
    {
      id: "se1",
      name: "Advanced Software Engineering",
      code: "IN0006",
      credits: 6,
      semester: "Winter",
      description: "Modern software engineering methodologies and practices",
      category: "Cross-Disciplinary Electives",
      subcategory: "Software Engineering",
    },
    {
      id: "se2",
      name: "Software Testing and Quality Assurance",
      code: "IN0013",
      credits: 6,
      semester: "Summer",
      description: "Comprehensive testing strategies and quality management",
      category: "Cross-Disciplinary Electives",
      subcategory: "Software Engineering",
    },
    {
      id: "se3",
      name: "DevOps and Continuous Integration",
      code: "IN0025",
      credits: 5,
      semester: "Winter",
      description: "Modern deployment and integration practices",
      category: "Cross-Disciplinary Electives",
      subcategory: "Software Engineering",
    },

    // Cross-Disciplinary Electives - Machine Learning
    {
      id: "ml1",
      name: "Introduction to Machine Learning",
      code: "IN2064",
      credits: 6,
      semester: "Winter",
      description: "Fundamental machine learning algorithms and applications",
      prerequisites: ["Linear Algebra", "Statistics"],
      category: "Cross-Disciplinary Electives",
      subcategory: "Machine Learning and Data Analysis",
    },
    {
      id: "ml2",
      name: "Deep Learning",
      code: "IN2346",
      credits: 6,
      semester: "Summer",
      description: "Neural networks and deep learning architectures",
      prerequisites: ["Machine Learning"],
      category: "Cross-Disciplinary Electives",
      subcategory: "Machine Learning and Data Analysis",
    },
    {
      id: "ml3",
      name: "Natural Language Processing",
      code: "IN2361",
      credits: 6,
      semester: "Winter",
      description: "Processing and understanding of human language",
      category: "Cross-Disciplinary Electives",
      subcategory: "Machine Learning and Data Analysis",
    },

    // Cross-Disciplinary Electives - Databases
    {
      id: "db1",
      name: "Advanced Database Systems",
      code: "IN2118",
      credits: 6,
      semester: "Summer",
      description: "Advanced topics in database management systems",
      prerequisites: ["Database Systems"],
      category: "Cross-Disciplinary Electives",
      subcategory: "Databases and Information Systems",
    },
    {
      id: "db2",
      name: "Big Data Analytics",
      code: "IN2106",
      credits: 6,
      semester: "Winter",
      description: "Processing and analysis of large-scale datasets",
      category: "Cross-Disciplinary Electives",
      subcategory: "Databases and Information Systems",
    },

    // Cross-Disciplinary Electives - Security
    {
      id: "sec1",
      name: "IT Security",
      code: "IN0011",
      credits: 6,
      semester: "Winter",
      description: "Fundamentals of information technology security",
      category: "Cross-Disciplinary Electives",
      subcategory: "Security and Data Protection",
    },
    {
      id: "sec2",
      name: "Cryptography",
      code: "IN2055",
      credits: 6,
      semester: "Summer",
      description: "Mathematical foundations of cryptographic systems",
      category: "Cross-Disciplinary Electives",
      subcategory: "Security and Data Protection",
    },

    // Cross-Disciplinary Electives - Management
    {
      id: "mgmt1",
      name: "IT Project Management",
      code: "WI000123",
      credits: 6,
      semester: "Winter",
      description: "Managing information technology projects",
      category: "Cross-Disciplinary Electives",
      subcategory: "Management",
    },
    {
      id: "mgmt2",
      name: "Digital Transformation",
      code: "WI000145",
      credits: 6,
      semester: "Summer",
      description: "Strategic aspects of digital transformation",
      category: "Cross-Disciplinary Electives",
      subcategory: "Management",
    },

    // Cross-Disciplinary Electives - Computer Graphics
    {
      id: "cg1",
      name: "Computer Graphics",
      code: "IN2097",
      credits: 6,
      semester: "Winter",
      description: "Fundamentals of computer graphics and visualization",
      category: "Cross-Disciplinary Electives",
      subcategory: "Computer Graphics and Vision",
    },
    {
      id: "cg2",
      name: "Computer Vision",
      code: "IN2028",
      credits: 6,
      semester: "Summer",
      description: "Automated analysis and understanding of images",
      category: "Cross-Disciplinary Electives",
      subcategory: "Computer Graphics and Vision",
    },

    // Elective Modules in Interdisciplinary Fundamentals
    {
      id: "if1",
      name: "Ethics in Information Technology",
      code: "IN0014",
      credits: 3,
      semester: "Summer",
      description: "Ethical considerations in IT development and deployment",
      category: "Elective Modules in Interdisciplinary Fundamentals",
    },
    {
      id: "if2",
      name: "Technology Innovation and Entrepreneurship",
      code: "IN0016",
      credits: 3,
      semester: "Winter",
      description: "Innovation processes and technology entrepreneurship",
      category: "Elective Modules in Interdisciplinary Fundamentals",
    },
  ];

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, use mock data
      setCourses(mockCourses);
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

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group courses by category and subcategory
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = {};
    }

    const subcategory = course.subcategory || "main";
    if (!acc[course.category][subcategory]) {
      acc[course.category][subcategory] = [];
    }

    acc[course.category][subcategory].push(course);
    return acc;
  }, {} as Record<string, Record<string, Course[]>>);

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

  const getSubcategoryColor = (subcategory: string) => {
    const colors = [
      "#1976d2",
      "#388e3c",
      "#f57c00",
      "#7b1fa2",
      "#c2185b",
      "#00796b",
      "#5d4037",
      "#455a64",
      "#e91e63",
      "#8bc34a",
      "#ff5722",
      "#607d8b",
      "#795548",
      "#9e9e9e",
      "#3f51b5",
    ];
    const hash = subcategory.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
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

  const handleAccordionChange = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
              M.Sc. Information Systems Curriculum
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: "#aaa", mb: 2 }}>
            Explore available courses in your study program (Total:{" "}
            {totalCredits} ECTS)
          </Typography>
        </Box>

        {/* Program Structure Overview */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: "#2a2a2a", color: "white" }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Program Structure Overview
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={category}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "#333",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: getCategoryColor(category),
                      fontWeight: "bold",
                      mb: 1,
                    }}
                  >
                    {getCategoryCredits(category)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#aaa", display: "block" }}
                  >
                    ECTS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 1 }}>
                    {category}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
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
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a2a2a",
              "& fieldset": {
                borderColor: "#555",
              },
              "&:hover fieldset": {
                borderColor: "#646cff",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#646cff",
              },
            },
            "& .MuiInputBase-input": {
              color: "white",
            },
          }}
        />

        {/* Course Categories */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Course Categories
          </Typography>

          {categories.map((category) => {
            const categoryData = groupedCourses[category];
            if (!categoryData) return null;

            const isExpanded = expandedCategories.includes(category);
            const totalCoursesInCategory =
              Object.values(categoryData).flat().length;

            return (
              <Accordion
                key={category}
                expanded={isExpanded}
                onChange={() => handleAccordionChange(category)}
                sx={{
                  mb: 2,
                  backgroundColor: "#2a2a2a",
                  color: "white",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { margin: "0 0 16px 0" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                  sx={{
                    backgroundColor: "#333",
                    borderLeft: `4px solid ${getCategoryColor(category)}`,
                    "&:hover": { backgroundColor: "#404040" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {category}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#aaa" }}>
                        {getCategoryCredits(category)} ECTS required •{" "}
                        {totalCoursesInCategory} courses available
                      </Typography>
                    </Box>
                    <Chip
                      label={`${getCategoryCredits(category)} ECTS`}
                      sx={{
                        backgroundColor: getCategoryColor(category),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  {Object.entries(categoryData).map(
                    ([subcategory, subcategoryCourses]) => (
                      <Box
                        key={subcategory}
                        sx={{ mb: subcategory !== "main" ? 3 : 0 }}
                      >
                        {subcategory !== "main" && (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", flexGrow: 1 }}
                              >
                                {subcategory}
                              </Typography>
                              <Chip
                                label={`${subcategoryCourses.reduce(
                                  (sum, course) => sum + course.credits,
                                  0
                                )} ECTS available`}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    getSubcategoryColor(subcategory),
                                  color: "white",
                                }}
                              />
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "#555" }} />
                          </>
                        )}

                        <Grid container spacing={2}>
                          {subcategoryCourses.map((course) => (
                            <Grid
                              size={{ xs: 12, md: 6, lg: 4 }}
                              key={course.id}
                            >
                              <Card
                                sx={{
                                  backgroundColor: "#1a1a1a",
                                  color: "white",
                                  border: "1px solid #444",
                                  "&:hover": {
                                    backgroundColor: "#333",
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 4px 20px ${getCategoryColor(
                                      category
                                    )}30`,
                                  },
                                  transition: "all 0.2s ease-in-out",
                                  cursor: "pointer",
                                }}
                              >
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: "bold",
                                        flexGrow: 1,
                                        fontSize: "1rem",
                                      }}
                                    >
                                      {course.name}
                                    </Typography>
                                    <Chip
                                      label={`${course.credits} ECTS`}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          getCategoryColor(category),
                                        color: "white",
                                        fontSize: "0.75rem",
                                        ml: 1,
                                      }}
                                    />
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#aaa", mb: 1 }}
                                  >
                                    {course.code} • {course.semester}
                                  </Typography>

                                  {course.description && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mb: 2,
                                        color: "#ccc",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {course.description}
                                    </Typography>
                                  )}

                                  {course.prerequisites &&
                                    course.prerequisites.length > 0 && (
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#aaa",
                                            mb: 1,
                                            display: "block",
                                          }}
                                        >
                                          Prerequisites:
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                          }}
                                        >
                                          {course.prerequisites.map(
                                            (prereq, index) => (
                                              <Chip
                                                key={index}
                                                label={prereq}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                  borderColor: "#555",
                                                  color: "#aaa",
                                                  fontSize: "0.7rem",
                                                }}
                                              />
                                            )
                                          )}
                                        </Box>
                                      </Box>
                                    )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

          {Object.keys(groupedCourses).length === 0 && (
            <Paper
              sx={{
                p: 4,
                backgroundColor: "#2a2a2a",
                color: "white",
                textAlign: "center",
              }}
            >
              <School sx={{ fontSize: "3rem", color: "#666", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
                {searchQuery ? "No courses found" : "No courses available"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Curriculum data will be loaded here"}
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CurriculumPage;
