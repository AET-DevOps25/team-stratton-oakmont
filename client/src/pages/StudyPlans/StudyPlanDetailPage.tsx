import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  getStudyPlanById,
  getStudyProgramById,
  StudyPlanApiError,
} from "../../api/studyPlans";
import type { StudyPlanDto, StudyProgramDto } from "../../api/studyPlans";
import AnalyticsDashboard from "../../components/ui/AnalyticsDashboard";
import SemesterCard from "../../components/ui/SemesterCard";
import type { SemesterData, Course } from "../../components/ui/SemesterCard";
import CourseSearchDialog from "../../components/ui/CourseSearchDialog";

interface StudyPlanDetailPageProps {}

const StudyPlanDetailPage: React.FC<StudyPlanDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for the specific study plan
  const [studyPlan, setStudyPlan] = useState<StudyPlanDto | null>(null);
  const [studyProgram, setStudyProgram] = useState<StudyProgramDto | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for semesters and courses
  const [semesters, setSemesters] = useState<SemesterData[]>([]);

  // State for dialogs
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [newSemesterDialogOpen, setNewSemesterDialogOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  // Get all courses from all semesters
  const allCourses = semesters.flatMap((semester) => semester.courses);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchStudyPlanById = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the actual API call
      const planResponse = await getStudyPlanById(planId);
      setStudyPlan(planResponse);

      // Parse plan data if it exists
      if (planResponse.planData) {
        try {
          const parsedPlanData = JSON.parse(planResponse.planData);
          if (
            parsedPlanData.semesters &&
            Array.isArray(parsedPlanData.semesters)
          ) {
            setSemesters(parsedPlanData.semesters);
          }
        } catch (parseError) {
          console.warn("Could not parse plan data:", parseError);
        }
      }

      // Fetch the study program if studyProgramId exists
      if (planResponse.studyProgramId) {
        try {
          const programResponse = await getStudyProgramById(
            planResponse.studyProgramId
          );
          setStudyProgram(programResponse);
        } catch (programErr) {
          console.warn("Could not fetch study program details:", programErr);
        }
      }
    } catch (err) {
      console.error("Error fetching study plan:", err);

      if (err instanceof StudyPlanApiError) {
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to view this study plan."
          );
        } else if (err.statusCode === 404) {
          setError("Study plan not found.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to load study plan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudyPlanById(id);
    }
  }, [id]);

  const handleBack = () => {
    navigate("/study-plans");
  };

  // Semester management functions
  const generateNextSemesterName = () => {
    if (semesters.length === 0) {
      // Default to Winter of current year if no semesters exist
      const currentYear = new Date().getFullYear();
      return `Winter ${currentYear}`;
    }

    const lastSemester = semesters[semesters.length - 1];
    const lastSemesterName = lastSemester.name;

    // Extract year and season from the last semester
    const winterMatch = lastSemesterName.match(/Winter (\d+)/);
    const summerMatch = lastSemesterName.match(/Summer (\d+)/);

    if (winterMatch) {
      const year = parseInt(winterMatch[1]);
      return `Summer ${year}`;
    } else if (summerMatch) {
      const year = parseInt(summerMatch[1]);
      return `Winter ${year + 1}`;
    } else {
      // Fallback: if we can't parse the semester name, default to Winter of current year
      const currentYear = new Date().getFullYear();
      return `Winter ${currentYear}`;
    }
  };

  const handleAddSemester = () => {
    const newSemesterName = generateNextSemesterName();
    const newSemester: SemesterData = {
      id: Date.now().toString(),
      name: newSemesterName,
      courses: [],
      expanded: true,
    };
    setSemesters([...semesters, newSemester]);
  };

  const handleStartingSemesterSelection = (type: "winter" | "summer") => {
    const currentYear = new Date().getFullYear();

    const semesters: SemesterData[] = [];

    for (let i = 0; i < 4; i++) {
      let semesterName: string;
      let year: number;

      if (type === "winter") {
        // Winter, Summer, Winter, Summer pattern
        if (i % 2 === 0) {
          year = currentYear + Math.floor(i / 2);
          semesterName = `Winter ${year}`;
        } else {
          year = currentYear + Math.floor(i / 2) + 1;
          semesterName = `Summer ${year}`;
        }
      } else {
        // Summer, Winter, Summer, Winter pattern
        if (i % 2 === 0) {
          year = currentYear + Math.floor(i / 2);
          semesterName = `Summer ${year}`;
        } else {
          year = currentYear + Math.floor(i / 2) + 1;
          semesterName = `Winter ${year}`;
        }
      }

      semesters.push({
        id: (i + 1).toString(),
        name: semesterName,
        courses: [],
        expanded: true,
      });
    }

    setSemesters(semesters);
  };

  const handleCreateSemester = () => {
    if (newSemesterName.trim()) {
      const newSemester: SemesterData = {
        id: Date.now().toString(),
        name: newSemesterName.trim(),
        courses: [],
        expanded: true,
      };
      setSemesters([...semesters, newSemester]);
      setNewSemesterName("");
      setNewSemesterDialogOpen(false);
    }
  };

  const handleRemoveSemester = (semesterId: string) => {
    setSemesters(semesters.filter((semester) => semester.id !== semesterId));
  };

  const handleToggleSemesterExpanded = (semesterId: string) => {
    setSemesters(
      semesters.map((semester) =>
        semester.id === semesterId
          ? { ...semester, expanded: !semester.expanded }
          : semester
      )
    );
  };

  const handleRenameSemester = (semesterId: string, newName: string) => {
    setSemesters(
      semesters.map((semester) =>
        semester.id === semesterId ? { ...semester, name: newName } : semester
      )
    );
  };

  // Drag and drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which semesters contain the dragged and target courses
    const activeSemester = semesters.find((s) =>
      s.courses.some((c) => c.id === activeId)
    );
    const overSemester =
      semesters.find((s) => s.courses.some((c) => c.id === overId)) ||
      semesters.find((s) => s.id === overId);

    if (!activeSemester || !overSemester) return;

    const activeCourse = activeSemester.courses.find((c) => c.id === activeId);
    if (!activeCourse) return;

    // If moving within the same semester
    if (activeSemester.id === overSemester.id) {
      const oldIndex = activeSemester.courses.findIndex(
        (c) => c.id === activeId
      );
      const newIndex = activeSemester.courses.findIndex((c) => c.id === overId);

      if (oldIndex !== newIndex) {
        setSemesters(
          semesters.map((semester) =>
            semester.id === activeSemester.id
              ? {
                  ...semester,
                  courses: arrayMove(semester.courses, oldIndex, newIndex),
                }
              : semester
          )
        );
      }
    } else {
      // Moving between semesters
      setSemesters(
        semesters.map((semester) => {
          if (semester.id === activeSemester.id) {
            // Remove from source semester
            return {
              ...semester,
              courses: semester.courses.filter((c) => c.id !== activeId),
            };
          } else if (semester.id === overSemester.id) {
            // Add to target semester
            return {
              ...semester,
              courses: [...semester.courses, activeCourse],
            };
          }
          return semester;
        })
      );
    }
  };

  // Course management functions
  const handleAddCourse = (semesterId: string) => {
    setActiveSemesterId(semesterId);
    setCourseSearchOpen(true);
  };

  const handleAddCourseToSemester = (course: Course) => {
    if (activeSemesterId) {
      setSemesters(
        semesters.map((semester) =>
          semester.id === activeSemesterId
            ? {
                ...semester,
                courses: [...semester.courses, { ...course, completed: false }],
              }
            : semester
        )
      );
    }
  };

  const handleAddCoursesToSemester = (courses: Course[]) => {
    if (activeSemesterId) {
      setSemesters(
        semesters.map((semester) =>
          semester.id === activeSemesterId
            ? {
                ...semester,
                courses: [
                  ...semester.courses,
                  ...courses.map((course) => ({ ...course, completed: false })),
                ],
              }
            : semester
        )
      );
    }
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setSemesters(
      semesters.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.filter(
                (course) => course.id !== courseId
              ),
            }
          : semester
      )
    );
  };

  const handleToggleCourseCompleted = (
    semesterId: string,
    courseId: string
  ) => {
    setSemesters(
      semesters.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.map((course) =>
                course.id === courseId
                  ? { ...course, completed: !course.completed }
                  : course
              ),
            }
          : semester
      )
    );
  };

  // Get used course IDs to exclude from search
  const usedCourseIds = allCourses.map((course) => course.id);

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
          <Button variant="contained" onClick={handleBack}>
            Back to Study Plans
          </Button>
        </Container>
      </Box>
    );
  }

  if (!studyPlan) {
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
          <Typography variant="h6">Study plan not found</Typography>
          <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
            Back to Study Plans
          </Button>
        </Container>
      </Box>
    );
  }

  const totalCredits = studyProgram?.totalCredits || 120;

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
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {studyPlan.name}
            </Typography>
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              {studyProgram?.name ||
                studyPlan.studyProgramName ||
                "No Program Assigned"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Last modified:{" "}
              {new Date(studyPlan.lastModified).toLocaleDateString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/curriculum")}
            sx={{
              background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #535bf2 0%, #4c4bef 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 16px rgba(100, 108, 255, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            View Curriculum
          </Button>
        </Box>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard
          courses={allCourses}
          totalRequiredCredits={totalCredits}
          expanded={analyticsExpanded}
          onToggleExpanded={() => setAnalyticsExpanded(!analyticsExpanded)}
        />

        {/* Semesters Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
              Study Plan
            </Typography>
            {semesters.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddSemester}
                sx={{
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#535bf2",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                Add Semester
              </Button>
            )}
          </Box>

          {semesters.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ color: "#e0e0e0", mb: 4 }}>
                In which semester are you planning to start?
              </Typography>
              <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleStartingSemesterSelection("winter")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                    color: "white",
                    borderRadius: "50px",
                    px: 5,
                    py: 2.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    minWidth: "200px",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #535bf2 0%, #4c4bef 100%)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 24px rgba(100, 108, 255, 0.4)",
                    },
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 20px rgba(100, 108, 255, 0.2)",
                  }}
                >
                  Winter Semester
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleStartingSemesterSelection("summer")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                    color: "white",
                    borderRadius: "50px",
                    px: 5,
                    py: 2.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    minWidth: "200px",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 24px rgba(255, 152, 0, 0.4)",
                    },
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 20px rgba(255, 152, 0, 0.2)",
                  }}
                >
                  Summer Semester
                </Button>
              </Box>
            </Box>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Grid container spacing={3} direction="column">
                {semesters.map((semester) => (
                  <Grid size={{ xs: 12 }} key={semester.id}>
                    <SemesterCard
                      semester={semester}
                      onAddCourse={handleAddCourse}
                      onRemoveSemester={handleRemoveSemester}
                      onToggleCourseCompleted={handleToggleCourseCompleted}
                      onRemoveCourse={handleRemoveCourse}
                      onToggleExpanded={handleToggleSemesterExpanded}
                      onRenameSemester={handleRenameSemester}
                    />
                  </Grid>
                ))}
              </Grid>
            </DndContext>
          )}
        </Box>

        {/* Course Search Dialog */}
        <CourseSearchDialog
          open={courseSearchOpen}
          onClose={() => setCourseSearchOpen(false)}
          onAddCourse={handleAddCourseToSemester}
          onAddCourses={handleAddCoursesToSemester}
          title="Add Course to Semester"
          excludeIds={usedCourseIds}
        />

        {/* New Semester Dialog */}
        <Dialog
          open={newSemesterDialogOpen}
          onClose={() => setNewSemesterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "#2a2a2a",
              color: "white",
            },
          }}
        >
          <DialogTitle>Add New Semester</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Semester Name"
              fullWidth
              variant="outlined"
              value={newSemesterName}
              onChange={(e) => setNewSemesterName(e.target.value)}
              placeholder="e.g., Winter 2027, Summer 2027"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#333",
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#646cff" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "#aaa" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#646cff" },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setNewSemesterDialogOpen(false)}
              sx={{ color: "#aaa" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSemester}
              variant="contained"
              disabled={!newSemesterName.trim()}
              sx={{
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
              }}
            >
              Add Semester
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StudyPlanDetailPage;
