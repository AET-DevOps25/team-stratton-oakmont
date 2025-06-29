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
} from "@mui/material";
import { Search, School, MenuBook } from "@mui/icons-material";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  description?: string;
  prerequisites?: string[];
  category: string;
}

interface CurriculumPageProps {}

const CurriculumPage: React.FC<CurriculumPageProps> = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock data for now - will be replaced with API calls later
  const mockCourses: Course[] = [
    {
      id: "1",
      name: "Introduction to Algorithms",
      code: "IN0001",
      credits: 6,
      semester: "Winter",
      description: "Fundamental algorithms and data structures",
      prerequisites: ["Mathematics I"],
      category: "Core"
    },
    {
      id: "2",
      name: "Database Systems",
      code: "IN0002",
      credits: 6,
      semester: "Summer",
      description: "Design and implementation of database systems",
      prerequisites: ["Programming Fundamentals"],
      category: "Core"
    },
    {
      id: "3",
      name: "Machine Learning",
      code: "IN0003",
      credits: 6,
      semester: "Winter",
      description: "Introduction to machine learning algorithms and applications",
      prerequisites: ["Linear Algebra", "Statistics"],
      category: "Elective"
    },
    {
      id: "4",
      name: "Web Technologies",
      code: "IN0004",
      credits: 5,
      semester: "Summer",
      description: "Modern web development technologies and frameworks",
      prerequisites: ["Programming Fundamentals"],
      category: "Elective"
    }
  ];

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'core':
        return '#4caf50';
      case 'elective':
        return '#646cff';
      default:
        return '#ff9800';
    }
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
              Curriculum
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: "#aaa", mb: 2 }}>
            Explore available courses in your study program
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search courses by name, code, or description..."
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
        </Box>

        {/* Course Statistics */}
        <Paper
          sx={{ p: 3, mb: 4, backgroundColor: "#2a2a2a", color: "white" }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Course Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ color: "#646cff", fontWeight: "bold" }}>
                  {courses.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Total Courses
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ color: "#4caf50", fontWeight: "bold" }}>
                  {courses.filter(c => c.category === 'Core').length}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Core Courses
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ color: "#ff9800", fontWeight: "bold" }}>
                  {courses.reduce((sum, course) => sum + course.credits, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Total ECTS
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Courses List */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Available Courses ({filteredCourses.length})
          </Typography>

          {filteredCourses.length === 0 ? (
            <Paper
              sx={{ p: 4, backgroundColor: "#2a2a2a", color: "white", textAlign: "center" }}
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
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={course.id}>
                  <Card
                    sx={{
                      backgroundColor: "#2a2a2a",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#333",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 20px rgba(100, 108, 255, 0.3)",
                      },
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
                          {course.name}
                        </Typography>
                        <Chip
                          label={course.category}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(course.category),
                            color: "white",
                            fontSize: "0.75rem",
                            ml: 1,
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                        {course.code} • {course.credits} ECTS • {course.semester}
                      </Typography>

                      {course.description && (
                        <Typography variant="body2" sx={{ mb: 2, color: "#ccc" }}>
                          {course.description}
                        </Typography>
                      )}

                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ color: "#aaa", mb: 1, display: "block" }}>
                            Prerequisites:
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {course.prerequisites.map((prereq, index) => (
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
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CurriculumPage;