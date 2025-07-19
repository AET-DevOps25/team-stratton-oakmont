import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Checkbox,
  Button,
  Collapse,
  TextField,
} from "@mui/material";
import {
  Add,
  Delete,
  DragIndicator,
  ExpandMore,
  ExpandLess,
  School,
  Edit,
  Check,
  Close,
} from "@mui/icons-material";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CourseDetailsDialog } from "./CourseDetailsDialog";
import { moduleDetailsAPI } from "../../api/moduleDetails";

// Minimal course interface for semester management (without language, description, prerequisites)
interface SemesterCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  professor: string;
  occurrence: string;
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  completed?: boolean;
}

interface SemesterData {
  id: string;
  name: string;
  courses: SemesterCourse[];
  expanded?: boolean;
}

interface CourseItemProps {
  course: SemesterCourse;
  onToggleCompleted: (courseId: string) => void;
  onRemoveCourse: (courseId: string) => void;
  onCourseClick?: (course: SemesterCourse) => void;
  semesterId: string;
}

const CourseItem: React.FC<CourseItemProps> = ({
  course,
  onToggleCompleted,
  onRemoveCourse,
  onCourseClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        backgroundColor: "#2a2a2a",
        borderLeft: `4px solid ${getCategoryColor(course.category)}`,
        borderRadius: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#333",
        },
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          minHeight: "60px",
        }}
      >
        {/* Drag Handle */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            display: "flex",
            alignItems: "center",
          }}
        >
          <DragIndicator sx={{ color: "#666" }} />
        </Box>

        {/* Course Name */}
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: course.completed ? "#aaa" : "white",
              cursor: "pointer",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&:hover": {
                color: course.completed ? "#ccc" : "#646cff",
                textDecoration: "underline",
              },
              transition: "color 0.2s ease",
            }}
            onClick={() => onCourseClick?.(course)}
          >
            {course.name}
          </Typography>
        </Box>

        {/* Course Code */}
        <Box sx={{ width: "80px", textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            {course.code}
          </Typography>
        </Box>

        {/* Credits */}
        <Box sx={{ width: "60px", textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            {course.credits} ECTS
          </Typography>
        </Box>

        {/* Professor */}
        <Box sx={{ width: "120px", textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#aaa",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {course.professor}
          </Typography>
        </Box>

        {/* Category */}
        <Box sx={{ width: "100px", textAlign: "center" }}>
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
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>

        {/* Checkbox */}
        <Checkbox
          checked={course.completed || false}
          onChange={() => onToggleCompleted(course.id)}
          sx={{
            color: "#646cff",
            "&.Mui-checked": {
              color: "#4caf50",
            },
            ml: 1,
          }}
        />

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => onRemoveCourse(course.id)}
          sx={{
            color: "#f44336",
            "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
            ml: 1,
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

interface SemesterCardProps {
  semester: SemesterData;
  onAddCourse: (semesterId: string) => void;
  onRemoveSemester: (semesterId: string) => void;
  onToggleCourseCompleted: (semesterId: string, courseId: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onToggleExpanded: (semesterId: string) => void;
  onRenameSemester: (semesterId: string, newName: string) => void;
}

const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  onAddCourse,
  onRemoveSemester,
  onToggleCourseCompleted,
  onRemoveCourse,
  onToggleExpanded,
  onRenameSemester,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(semester.name);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(semester.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== semester.name) {
      onRenameSemester(semester.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(semester.name);
  };

  const handleCourseClick = async (course: SemesterCourse) => {
    try {
      // Fetch full module details using the moduleId or code
      const moduleId = course.code || course.id;
      const moduleDetails = await moduleDetailsAPI.getModuleDetailsByModuleId(
        moduleId
      );

      if (moduleDetails) {
        // Create a rich Course object with all ModuleDetails data preserved
        const enrichedCourse = {
          id: moduleDetails.id.toString(),
          name: moduleDetails.name,
          code: moduleDetails.moduleId,
          moduleId: moduleDetails.moduleId,
          credits: moduleDetails.credits,
          semester: course.semester, // Keep the extracted semester
          language: moduleDetails.language,
          professor: course.professor, // Keep the existing professor
          responsible: moduleDetails.responsible,
          occurrence: moduleDetails.occurrence,
          category: moduleDetails.category,
          subcategory: moduleDetails.subcategory,
          completed: course.completed,
          // ModuleDetails specific fields
          organisation: moduleDetails.organisation,
          moduleLevel: moduleDetails.moduleLevel,
          totalHours: moduleDetails.totalHours,
          contactHours: moduleDetails.contactHours,
          selfStudyHours: moduleDetails.selfStudyHours,
          descriptionOfAchievementAndAssessmentMethods:
            moduleDetails.descriptionOfAchievementAndAssessmentMethods,
          examRetakeNextSemester: moduleDetails.examRetakeNextSemester,
          examRetakeAtTheEndOfSemester: moduleDetails.examRetakeAtTheEndOfSemester,
          prerequisitesRecommended: moduleDetails.prerequisitesRecommended,
          intendedLearningOutcomes: moduleDetails.intendedLearningOutcomes,
          content: moduleDetails.content,
          teachingAndLearningMethods: moduleDetails.teachingAndLearningMethods,
          media: moduleDetails.media,
          readingList: moduleDetails.readingList,
        };

        setSelectedCourse(enrichedCourse);
      } else {
        // Fallback to basic course data if module details not found
        setSelectedCourse({
          ...course,
          language: "N/A", // Add missing language field for compatibility
        });
      }
      setCourseDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching module details:", error);
      // Fallback to basic course data on error
      setSelectedCourse({
        ...course,
        language: "N/A", // Add missing language field for compatibility
      });
      setCourseDetailsOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setCourseDetailsOpen(false);
    setSelectedCourse(null);
  };

  // Function to detect semester type
  const getSemesterType = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('summer') || nameLower.includes('ss')) {
      return { type: 'Summer', color: '#ff9800' };
    } else if (nameLower.includes('winter') || nameLower.includes('ws')) {
      return { type: 'Winter', color: '#2196f3' };
    } else {
      // Try to detect from semester number (odd = winter, even = summer in many systems)
      const semesterNumber = parseInt(name.match(/(\d+)/)?.[1] || '0');
      if (semesterNumber > 0) {
        return semesterNumber % 2 === 1 
          ? { type: 'Winter', color: '#2196f3' }
          : { type: 'Summer', color: '#ff9800' };
      }
    }
    return null;
  };

  const semesterTypeInfo = getSemesterType(semester.name);

  return (
    <Paper
      sx={{
        backgroundColor: "#2a2a2a",
        borderRadius: 3,
        border: "2px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: semester.expanded ? "1px solid #444" : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <School sx={{ color: "#646cff" }} />
            {isEditing ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#333",
                      "& fieldset": { borderColor: "#555" },
                      "&:hover fieldset": { borderColor: "#646cff" },
                      "&.Mui-focused fieldset": { borderColor: "#646cff" },
                    },
                    "& .MuiInputBase-input": { color: "white" },
                  }}
                />
                <IconButton
                  onClick={handleSaveEdit}
                  sx={{ color: "#4caf50" }}
                >
                  <Check />
                </IconButton>
                <IconButton
                  onClick={handleCancelEdit}
                  sx={{ color: "#f44336" }}
                >
                  <Close />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ color: "white", fontWeight: 600 }}
                  onClick={handleStartEdit}
                >
                  {semester.name}
                </Typography>
                <IconButton
                  onClick={handleStartEdit}
                  sx={{ color: "#646cff" }}
                >
                  <Edit />
                </IconButton>
              </Box>
            )}
            {semesterTypeInfo && (
              <Chip
                label={semesterTypeInfo.type}
                size="small"
                sx={{ 
                  backgroundColor: semesterTypeInfo.color, 
                  color: "white",
                  fontWeight: 500
                }}
              />
            )}
            <Chip
              label={`${semester.courses.length} courses`}
              size="small"
              sx={{ backgroundColor: "#555", color: "white" }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              {totalCredits} ECTS
            </Typography>
            <IconButton
              onClick={() => onToggleExpanded(semester.id)}
              sx={{ color: "#aaa" }}
            >
              {semester.expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <IconButton
              onClick={() => onRemoveSemester(semester.id)}
              sx={{
                color: "#f44336",
                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Collapse in={semester.expanded}>
        <Box sx={{ p: 3, pt: 0 }}>
          {semester.courses.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                border: "2px dashed #555",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                No courses added yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => onAddCourse(semester.id)}
                sx={{
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#535bf2",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                Add Course
              </Button>
            </Box>
          ) : (
            <>
              {/* Table Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  backgroundColor: "#3a3a3a",
                  borderRadius: "4px 4px 0 0",
                  borderBottom: "1px solid #444",
                  mb: 1,
                }}
              >
                {/* Drag Handle Column */}
                <Box sx={{ width: "24px" }} />

                {/* Course Name Column */}
                <Box sx={{ flex: "1 1 auto" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    Course Name
                  </Typography>
                </Box>

                {/* Course Code Column */}
                <Box sx={{ width: "80px", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    Code
                  </Typography>
                </Box>

                {/* Credits Column */}
                <Box sx={{ width: "60px", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    ECTS
                  </Typography>
                </Box>

                {/* Professor Column */}
                <Box sx={{ width: "120px", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    Professor
                  </Typography>
                </Box>

                {/* Category Column */}
                <Box sx={{ width: "100px", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    Category
                  </Typography>
                </Box>

                {/* Checkbox Column */}
                <Box sx={{ width: "48px", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
                    Done
                  </Typography>
                </Box>

                {/* Delete Button Column */}
                <Box sx={{ width: "40px" }} />
              </Box>

              <SortableContext 
                items={semester.courses.map(course => course.id)}
                strategy={verticalListSortingStrategy}
              >
                {semester.courses.map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    onToggleCompleted={(courseId) => onToggleCourseCompleted(semester.id, courseId)}
                    onRemoveCourse={(courseId) => onRemoveCourse(semester.id, courseId)}
                    onCourseClick={handleCourseClick}
                    semesterId={semester.id}
                  />
                ))}
              </SortableContext>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => onAddCourse(semester.id)}
                sx={{
                  mt: 2,
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#535bf2",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
                fullWidth
              >
                Add Course
              </Button>
            </>
          )}
        </Box>
      </Collapse>

      <CourseDetailsDialog
        open={courseDetailsOpen}
        onClose={handleCloseDialog}
        course={selectedCourse}
      />
    </Paper>
  );
};

export default SemesterCard;
export type { SemesterData, SemesterCourse };
