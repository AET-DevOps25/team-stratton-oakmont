import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { Search, Close, Info } from "@mui/icons-material";
import { CourseDetailsDialog } from "./CourseDetailsDialog";

// Course interface matching CurriculumPage
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
  completed?: boolean;
  learningMethods?: string;
  assessment?: string;
}

interface CourseSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCourse: (course: Course) => void;
  onAddCourses?: (courses: Course[]) => void; // New prop for multi-selection
  title?: string;
  excludeIds?: string[];
}

const CourseSearchDialog: React.FC<CourseSearchDialogProps> = ({
  open,
  onClose,
  onAddCourse,
  onAddCourses,
  title = "Add Course",
  excludeIds = [],
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderBy, setOrderBy] = useState<keyof Course>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const multiSelectMode = true; // Always use multi-select mode

  // Mock data - same as CurriculumPage
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
      description: "Independent research project culminating in a master's thesis",
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
      description: "Advanced programming concepts and software engineering practices",
      prerequisites: ["Programming Fundamentals"],
      category: "Mandatory Courses",
      learningMethods: "Lectures, hands-on programming exercises, group projects, code reviews",
      assessment: "Written exam (60%), programming assignments (30%), participation (10%)",
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
    // Cross-Disciplinary Electives
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
      learningMethods: "Interactive lectures, Python programming labs, data analysis projects, algorithmic challenges",
      assessment: "Midterm exam (40%), final project (40%), weekly assignments (20%)",
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

  // Get unique categories from mock courses
  const uniqueCategories = Array.from(new Set(mockCourses.map(course => course.category)));

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  // Filter logic
  useEffect(() => {
    let filtered = courses.filter((course) => !excludeIds.includes(course.id));

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) => selectedCategories.includes(course.category));
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, excludeIds, selectedCategories]);

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

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "Master Thesis":
        return "Master Thesis";
      case "Mandatory Courses":
        return "Mandatory";
      case "Practical Courses":
        return "Practical";
      case "Cross-Disciplinary Electives":
        return "Electives";
      case "Elective Modules in Interdisciplinary Fundamentals":
        return "Interdisciplinary";
      default:
        return category;
    }
  };

  const handleAddCourse = (course: Course) => {
    if (multiSelectMode) {
      // In multi-select mode, toggle selection
      const newSelected = new Set(selectedCourses);
      if (newSelected.has(course.id)) {
        newSelected.delete(course.id);
      } else {
        newSelected.add(course.id);
      }
      setSelectedCourses(newSelected);
    } else {
      // In single-select mode, add immediately and close
      onAddCourse(course);
      onClose();
    }
  };

  const handleAddSelectedCourses = () => {
    if (onAddCourses && selectedCourses.size > 0) {
      const coursesToAdd = courses.filter(course => selectedCourses.has(course.id));
      onAddCourses(coursesToAdd);
    }
    handleClose();
  };

  const handleCourseRowClick = (course: Course, event: React.MouseEvent) => {
    // Check if the click was on a button or checkbox
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="checkbox"]')) {
      return; // Don't handle row click if button/checkbox was clicked
    }
    
    // In multi-select mode (which is always on), only handle adding to selection
    handleAddCourse(course);
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCourseDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setCourseDetailsOpen(false);
    setSelectedCourse(null);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedCourses(new Set());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#2a2a2a",
          color: "white",
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #444",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {selectedCourses.size > 0 && (
            <Typography variant="body2" sx={{ color: "#646cff" }}>
              {selectedCourses.size} selected
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#aaa" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: "1px solid #444" }}>
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
              width: "100%",
              mb: 3,
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

          {/* Category Filter Chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#aaa", mr: 1, alignSelf: "center" }}>
              Filter by category:
            </Typography>
            {uniqueCategories.map((category) => (
              <Chip
                key={category}
                label={getCategoryDisplayName(category)}
                onClick={() => handleCategoryToggle(category)}
                sx={{
                  backgroundColor: selectedCategories.includes(category) 
                    ? getCategoryColor(category) 
                    : "#555",
                  color: "white",
                  border: selectedCategories.includes(category) 
                    ? `2px solid ${getCategoryColor(category)}` 
                    : "2px solid transparent",
                  "&:hover": {
                    backgroundColor: selectedCategories.includes(category)
                      ? getCategoryColor(category)
                      : "#666",
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
            {selectedCategories.length > 0 && (
              <Chip
                label="Clear Filters"
                onClick={() => setSelectedCategories([])}
                sx={{
                  backgroundColor: "#f44336",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Courses Table */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <CircularProgress sx={{ color: "#646cff" }} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "50vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333", width: "50px" }}>
                    Select
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333" }}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                      sx={{ color: "white !important" }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333" }}>
                    <TableSortLabel
                      active={orderBy === "code"}
                      direction={orderBy === "code" ? order : "asc"}
                      onClick={() => handleSort("code")}
                      sx={{ color: "white !important" }}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333" }}>
                    <TableSortLabel
                      active={orderBy === "credits"}
                      direction={orderBy === "credits" ? order : "asc"}
                      onClick={() => handleSort("credits")}
                      sx={{ color: "white !important" }}
                    >
                      ECTS
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333" }}>
                    Professor
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333" }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#333", width: "50px" }}>
                    Info
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
                      cursor: "pointer",
                    }}
                    onClick={(event) => handleCourseRowClick(course, event)}
                  >
                    <TableCell sx={{ color: "white", width: "50px" }}>
                      <Checkbox
                        checked={selectedCourses.has(course.id)}
                        onChange={() => handleAddCourse(course)}
                        sx={{
                          color: "#646cff",
                          '&.Mui-checked': {
                            color: "#646cff",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                        }}
                      >
                        {course.name}
                      </Typography>
                      {course.description && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#aaa", display: "block", mt: 0.5 }}
                        >
                          {course.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{course.code}</TableCell>
                    <TableCell sx={{ color: "white" }}>{course.credits}</TableCell>
                    <TableCell sx={{ color: "white" }}>{course.professor}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={
                          course.category === "Mandatory Courses"
                            ? "Mandatory"
                            : course.category === "Practical Courses"
                            ? "Practical"
                            : course.category === "Cross-Disciplinary Electives"
                            ? "Electives"
                            : course.category === "Elective Modules in Interdisciplinary Fundamentals"
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
                    <TableCell sx={{ color: "white", width: "50px" }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course);
                        }}
                        sx={{
                          color: "#646cff",
                          "&:hover": { backgroundColor: "rgba(100, 108, 255, 0.1)" },
                        }}
                      >
                        <Info />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {sortedCourses.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              No courses found
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Try adjusting your search terms
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid #444", justifyContent: "space-between" }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "#aaa",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddSelectedCourses}
          disabled={selectedCourses.size === 0}
          sx={{
            backgroundColor: selectedCourses.size > 0 ? "#646cff" : "#555",
            color: "white",
            textTransform: "none",
            "&:hover": {
              backgroundColor: selectedCourses.size > 0 ? "#5a5acf" : "#555",
            },
            "&:disabled": {
              backgroundColor: "#555",
              color: "#999",
            },
          }}
        >
          Add {selectedCourses.size > 0 ? `${selectedCourses.size} ` : ""}Selected Course{selectedCourses.size !== 1 ? 's' : ''}
        </Button>
      </DialogActions>

      <CourseDetailsDialog
        open={courseDetailsOpen}
        onClose={handleCloseDetails}
        course={selectedCourse}
      />
    </Dialog>
  );
};

export default CourseSearchDialog;
