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
import { moduleDetailsAPI } from "../../api/moduleDetails";

// Course interface that can handle both simple Course and ModuleDetails
interface Course {
  id: string;
  name: string;
  code?: string;
  moduleId?: string; // For ModuleDetails
  credits: number;
  semester?: string;
  language: string;
  professor?: string;
  responsible?: string; // For ModuleDetails
  occurrence?: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  completed?: boolean;
  learningMethods?: string;
  assessment?: string;
  // ModuleDetails specific fields
  organisation?: string;
  moduleLevel?: string;
  totalHours?: number;
  contactHours?: number;
  selfStudyHours?: number;
  descriptionOfAchievementAndAssessmentMethods?: string;
  examRetakeNextSemester?: string;
  examRetakeAtTheEndOfSemester?: string;
  prerequisitesRecommended?: string;
  intendedLearningOutcomes?: string;
  content?: string;
  teachingAndLearningMethods?: string;
  media?: string;
  readingList?: string;
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
  const STUDY_PROGRAM_ID = 121; // M.Sc. Information Systems
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderBy, setOrderBy] = useState<keyof Course>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<string[]>([]);
  const multiSelectMode = true; // Always use multi-select mode

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // Fetch modules and categories in parallel
      const [moduleDetails, distinctCategories] = await Promise.all([
        moduleDetailsAPI.getModulesByStudyProgram(STUDY_PROGRAM_ID),
        moduleDetailsAPI.getDistinctCategories(STUDY_PROGRAM_ID),
      ]);

      // Convert ModuleDetails to Course format
      const convertedCourses = moduleDetails.map((module) =>
        moduleDetailsAPI.convertModuleDetailsToCourse(module)
      );

      setCourses(convertedCourses);
      setFilteredCourses(convertedCourses);
      setCategories(distinctCategories);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback to empty arrays on error
      setCourses([]);
      setFilteredCourses([]);
      setCategories([]);
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
          (course.code &&
            course.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
          course.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (course.professor &&
            course.professor
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (course.responsible &&
            course.responsible
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) =>
        selectedCategories.includes(course.category)
      );
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
      case "Mandatory":
      case "Mandatory Courses":
        return "#f44336";
      case "Practical":
      case "Practical Courses":
        return "#ff9800";
      case "Electives":
      case "Cross-Disciplinary Electives":
        return "#646cff";
      case "Interdisciplinary":
      case "Elective Modules in Interdisciplinary Fundamentals":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "Master Thesis":
        return "Master Thesis";
      case "Mandatory":
      case "Mandatory Courses":
        return "Mandatory";
      case "Practical":
      case "Practical Courses":
        return "Practical";
      case "Electives":
      case "Cross-Disciplinary Electives":
        return "Electives";
      case "Interdisciplinary":
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
      const coursesToAdd = courses.filter((course) =>
        selectedCourses.has(course.id)
      );
      onAddCourses(coursesToAdd);
    }
    handleClose();
  };

  const handleCourseRowClick = (course: Course, event: React.MouseEvent) => {
    // Check if the click was on a button or checkbox
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) {
      return; // Don't handle row click if button/checkbox was clicked
    }

    // In multi-select mode (which is always on), only handle adding to selection
    handleAddCourse(course);
  };

  const handleCourseClick = async (course: Course) => {
    try {
      // Fetch full module details using the moduleId or code
      const moduleId = course.code || course.id;
      const moduleDetails = await moduleDetailsAPI.getModuleDetailsByModuleId(
        moduleId
      );

      if (moduleDetails) {
        // Create a rich Course object with all ModuleDetails data preserved
        const enrichedCourse: Course = {
          id: moduleDetails.id.toString(),
          name: moduleDetails.name,
          code: moduleDetails.moduleId,
          moduleId: moduleDetails.moduleId,
          credits: moduleDetails.credits,
          semester: course.semester, // Keep the extracted semester
          language: moduleDetails.language,
          professor: moduleDetails.responsible,
          responsible: moduleDetails.responsible,
          occurrence: moduleDetails.occurrence,
          description:
            moduleDetails.intendedLearningOutcomes || moduleDetails.content,
          category: moduleDetails.category,
          subcategory: moduleDetails.subcategory,
          // Add all the rich ModuleDetails fields
          organisation: moduleDetails.organisation,
          moduleLevel: moduleDetails.moduleLevel,
          totalHours: moduleDetails.totalHours,
          contactHours: moduleDetails.contactHours,
          selfStudyHours: moduleDetails.selfStudyHours,
          descriptionOfAchievementAndAssessmentMethods:
            moduleDetails.descriptionOfAchievementAndAssessmentMethods,
          examRetakeNextSemester: moduleDetails.examRetakeNextSemester,
          examRetakeAtTheEndOfSemester:
            moduleDetails.examRetakeAtTheEndOfSemester,
          prerequisitesRecommended: moduleDetails.prerequisitesRecommended,
          intendedLearningOutcomes: moduleDetails.intendedLearningOutcomes,
          content: moduleDetails.content,
          teachingAndLearningMethods: moduleDetails.teachingAndLearningMethods,
          media: moduleDetails.media,
          readingList: moduleDetails.readingList,
        };
        setSelectedCourse(enrichedCourse);
      } else {
        // Fallback to the existing course data if module details not found
        setSelectedCourse(course);
      }

      setCourseDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching module details:", error);
      // Fallback to existing course data on error
      setSelectedCourse(course);
      setCourseDetailsOpen(true);
    }
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
            <Typography
              variant="body2"
              sx={{ color: "#aaa", mr: 1, alignSelf: "center" }}
            >
              Filter by category:
            </Typography>
            {categories.map((category) => (
              <Chip
                key={category}
                label={getCategoryDisplayName(category)}
                onClick={() => handleCategoryToggle(category)}
                sx={{
                  backgroundColor: selectedCategories.includes(category)
                    ? "#646cff"
                    : "#555",
                  color: "white",
                  border: selectedCategories.includes(category)
                    ? "2px solid #646cff"
                    : "2px solid transparent",
                  "&:hover": {
                    backgroundColor: selectedCategories.includes(category)
                      ? "#5a5acf"
                      : "#666",
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
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
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "50px",
                    }}
                  >
                    Select
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                      sx={{ color: "white !important" }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "code"}
                      direction={orderBy === "code" ? order : "asc"}
                      onClick={() => handleSort("code")}
                      sx={{ color: "white !important" }}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "credits"}
                      direction={orderBy === "credits" ? order : "asc"}
                      onClick={() => handleSort("credits")}
                      sx={{ color: "white !important" }}
                    >
                      ECTS
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                    }}
                  >
                    Professor
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "50px",
                    }}
                  >
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
                          "&.Mui-checked": {
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
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.code || course.moduleId || course.id}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.credits}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.professor || course.responsible || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={getCategoryDisplayName(course.category)}
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
                          "&:hover": {
                            backgroundColor: "rgba(100, 108, 255, 0.1)",
                          },
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

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid #444",
          justifyContent: "space-between",
        }}
      >
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
          Add {selectedCourses.size > 0 ? `${selectedCourses.size} ` : ""}
          Selected Course{selectedCourses.size !== 1 ? "s" : ""}
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
