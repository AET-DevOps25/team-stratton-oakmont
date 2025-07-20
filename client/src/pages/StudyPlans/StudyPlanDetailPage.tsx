import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
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
  StudyPlanApiError,
  createMultipleCourses,
  getSemestersByStudyPlan,
  createSemester,
  getCoursesBySemester,
  toggleSemesterCourseCompletion,
  deleteSemester,
  deleteSemesterCourse,
} from "../../api/studyPlans";
import type {
  StudyPlanDto,
  StudyProgramDto,
  SemesterCourseDto,
} from "../../api/studyPlans";
import AnalyticsDashboard from "../../components/ui/AnalyticsDashboard";
import SemesterCard from "../../components/ui/SemesterCard";
import type { SemesterData } from "../../components/ui/SemesterCard";
import CourseSearchDialog from "../../components/ui/CourseSearchDialog";

interface StudyPlanDetailPageProps {}

const StudyPlanDetailPage: React.FC<StudyPlanDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for the specific study plan
  const [studyPlan, setStudyPlan] = useState<StudyPlanDto | null>(null);
  const [studyProgram] = useState<StudyProgramDto | null>(null);
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

      // Load semesters from the new database tables
      try {
        const semesterResponse = await getSemestersByStudyPlan(
          parseInt(planId)
        );

        // Convert backend format to frontend format
        const convertedSemesters = semesterResponse.map((semester) => ({
          id: semester.id!.toString(),
          name: semester.name,
          courses: [], // Will be loaded separately if needed
          expanded: true,
        }));

        setSemesters(convertedSemesters);

        // Load courses for each semester
        for (const semester of semesterResponse) {
          if (semester.id) {
            try {
              const coursesResponse = await getCoursesBySemester(semester.id);
              // Update the semester with its courses
              setSemesters((prevSemesters) =>
                prevSemesters.map((s) =>
                  s.id === semester.id!.toString()
                    ? {
                        ...s,
                        courses: coursesResponse.map(
                          (course: SemesterCourseDto) => ({
                            id: course.id?.toString() || course.courseId, // Use database ID as string, fallback to courseId
                            name: course.courseName || course.courseId,
                            code: course.courseCode || course.courseId,
                            credits: course.credits || 0,
                            semester: "",
                            professor: course.professor || "",
                            occurrence: course.occurrence || "",
                            category: course.category || "",
                            subcategory: course.subcategory || "",
                            subSubcategory: "",
                            completed: course.isCompleted,
                          })
                        ),
                      }
                    : s
                )
              );
            } catch (courseError) {
              console.warn(
                `Could not load courses for semester ${semester.id}:`,
                courseError
              );
            }
          }
        }
      } catch (semesterError) {
        console.warn("Could not load semesters from database:", semesterError);
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

  const handleAddSemester = async () => {
    const newSemesterName = generateNextSemesterName();
    const newSemester: SemesterData = {
      id: Date.now().toString(),
      name: newSemesterName,
      courses: [],
      expanded: true,
    };

    // Update local state immediately for better UX
    setSemesters([...semesters, newSemester]);

    // Persist to backend
    try {
      if (studyPlan?.id) {
        const semesterRequest = {
          name: newSemesterName,
          studyPlanId: studyPlan.id,
          semesterOrder: semesters.length + 1,
          winterOrSummer: newSemesterName.toLowerCase().includes("winter")
            ? "WINTER"
            : "SUMMER",
        };

        const createdSemester = await createSemester(semesterRequest);

        // Update the local semester with the backend ID
        setSemesters((prevSemesters) =>
          prevSemesters.map((semester) =>
            semester.id === newSemester.id
              ? { ...semester, id: createdSemester.id!.toString() }
              : semester
          )
        );

        console.log(`Successfully created semester: ${newSemesterName}`);
      }
    } catch (error) {
      console.error("Failed to create semester in backend:", error);
      // You might want to show an error message to the user and revert local state
    }
  };

  const handleStartingSemesterSelection = async (type: "winter" | "summer") => {
    const currentYear = new Date().getFullYear();

    const localSemesters: SemesterData[] = [];

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

      localSemesters.push({
        id: (i + 1).toString(), // Temporary ID for UI
        name: semesterName,
        courses: [],
        expanded: true,
      });
    }

    // Update local state immediately for better UX
    setSemesters(localSemesters);

    // Persist all semesters to backend
    if (studyPlan?.id) {
      try {
        const createdSemesters: { localId: string; backendId: string }[] = [];

        for (let i = 0; i < localSemesters.length; i++) {
          const semester = localSemesters[i];

          const semesterRequest = {
            name: semester.name,
            studyPlanId: studyPlan.id,
            semesterOrder: i + 1,
            winterOrSummer: semester.name.toLowerCase().includes("winter")
              ? "WINTER"
              : "SUMMER",
          };

          try {
            const createdSemester = await createSemester(semesterRequest);
            createdSemesters.push({
              localId: semester.id,
              backendId: createdSemester.id!.toString(),
            });
            console.log(`Successfully created semester: ${semester.name}`);
          } catch (semesterError) {
            console.error(
              `Failed to create semester ${semester.name}:`,
              semesterError
            );
          }
        }

        // Update local state with backend IDs
        setSemesters((prevSemesters) =>
          prevSemesters.map((semester) => {
            const created = createdSemesters.find(
              (c) => c.localId === semester.id
            );
            return created ? { ...semester, id: created.backendId } : semester;
          })
        );

        console.log(
          `Successfully created ${createdSemesters.length} semesters for ${type} start`
        );
      } catch (error) {
        console.error("Failed to create semesters in backend:", error);
        // You might want to show an error message to the user
      }
    }
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

  const handleRemoveSemester = async (semesterId: string) => {
    // Find the semester to be removed for potential revert
    const semesterToRemove = semesters.find((s) => s.id === semesterId);

    if (!semesterToRemove) {
      console.warn("Semester not found for removal:", semesterId);
      return;
    }

    // Update local state immediately for better UX
    setSemesters(semesters.filter((semester) => semester.id !== semesterId));

    // Persist deletion to backend
    try {
      const semesterDbId = Number(semesterId);
      if (semesterDbId && !isNaN(semesterDbId)) {
        await deleteSemester(semesterDbId);
        console.log(`Successfully deleted semester with ID: ${semesterId}`);
      } else {
        console.warn("Invalid semester ID for deletion:", semesterId);
      }
    } catch (error) {
      console.error("Failed to delete semester from backend:", error);

      // Revert local state if backend call fails - add the semester back at the same position
      const originalIndex = semesters.findIndex((s) => s.id === semesterId);
      setSemesters((prevSemesters) => {
        const newSemesters = [...prevSemesters];
        newSemesters.splice(
          originalIndex >= 0 ? originalIndex : newSemesters.length,
          0,
          semesterToRemove
        );
        return newSemesters;
      });
      // You might want to show an error message to the user
    }
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

  const handleAddCourseToSemester = async (course: any) => {
    if (activeSemesterId) {
      try {
        // Create API request
        const courseRequest = {
          semesterId: parseInt(activeSemesterId),
          courseId: course.code || course.moduleId || course.id.toString(),
          courseOrder:
            (semesters.find((s) => s.id === activeSemesterId)?.courses.length ||
              0) + 1,
          isCompleted: false,
        };

        // Create course in backend first
        const createdCourse = await createMultipleCourses([courseRequest]);

        if (createdCourse.length > 0) {
          const backendCourse = createdCourse[0];

          // Convert to frontend format
          const semesterCourse = {
            id: backendCourse.id!.toString(), // Use backend database ID
            name: course.name,
            code: course.code || course.moduleId || "",
            credits: course.credits,
            semester: course.semester || "",
            professor: course.professor || course.responsible || "",
            occurrence: course.occurrence || "",
            category: course.category,
            subcategory: course.subcategory,
            subSubcategory: course.subSubcategory,
            completed: backendCourse.isCompleted,
          };

          // Update local state with backend data
          setSemesters(
            semesters.map((semester) =>
              semester.id === activeSemesterId
                ? {
                    ...semester,
                    courses: [...semester.courses, semesterCourse],
                  }
                : semester
            )
          );
        }
      } catch (error) {
        console.error("Failed to add course to backend:", error);
        // Don't update local state if backend fails
      }
    }
  };

  const handleAddCoursesToSemester = async (courses: any[]) => {
    if (activeSemesterId) {
      try {
        // Convert to backend format and create API requests
        const courseRequests = courses.map((course, index) => ({
          semesterId: parseInt(activeSemesterId),
          courseId: course.code || course.moduleId || course.id.toString(),
          courseOrder:
            (semesters.find((s) => s.id === activeSemesterId)?.courses.length ||
              0) +
            index +
            1,
          isCompleted: false,
        }));

        // Create courses in backend first
        const createdCourses = await createMultipleCourses(courseRequests);

        // Convert created courses to frontend format
        const semesterCourses = createdCourses.map((backendCourse) => {
          // Find the original course data to get name and other details
          const originalCourse = courses.find(
            (course) =>
              (course.code || course.moduleId || course.id.toString()) ===
              backendCourse.courseId
          );

          return {
            id: backendCourse.id!.toString(), // Use backend database ID
            name: originalCourse?.name || backendCourse.courseId,
            code: backendCourse.courseId,
            credits: originalCourse?.credits || 0,
            semester: "",
            professor:
              originalCourse?.professor || originalCourse?.responsible || "",
            occurrence: originalCourse?.occurrence || "",
            category: originalCourse?.category || "",
            subcategory: originalCourse?.subcategory || "",
            subSubcategory: originalCourse?.subSubcategory || "",
            completed: backendCourse.isCompleted,
          };
        });

        // Update local state with backend data
        setSemesters(
          semesters.map((semester) =>
            semester.id === activeSemesterId
              ? {
                  ...semester,
                  courses: [...semester.courses, ...semesterCourses],
                }
              : semester
          )
        );

        console.log(
          `Successfully added ${courses.length} courses to semester ${activeSemesterId}`
        );
      } catch (error) {
        console.error("Failed to persist courses to backend:", error);
        // Show error to user - don't update local state if backend fails
      }
    }
  };

  const handleRemoveCourse = async (semesterId: string, courseId: string) => {
    // Find the course to be removed for potential revert
    const semester = semesters.find((s) => s.id === semesterId);
    const courseToRemove = semester?.courses.find((c) => c.id === courseId);

    if (!courseToRemove) {
      console.warn("Course not found for removal:", courseId);
      return;
    }

    // Update local state immediately for better UX
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

    // Persist deletion to backend
    try {
      const courseDbId = Number(courseId);
      if (courseDbId && !isNaN(courseDbId)) {
        await deleteSemesterCourse(courseDbId);
        console.log(`Successfully deleted course with ID: ${courseId}`);
      } else {
        console.warn("Invalid course ID for deletion:", courseId);
      }
    } catch (error) {
      console.error("Failed to delete course from backend:", error);

      // Revert local state if backend call fails
      setSemesters(
        semesters.map((semester) =>
          semester.id === semesterId
            ? {
                ...semester,
                courses: [...semester.courses, courseToRemove], // Add the course back
              }
            : semester
        )
      );
      // You might want to show an error message to the user
    }
  };

  const handleToggleCourseCompleted = async (
    semesterId: string,
    courseId: string
  ) => {
    // Find the current course to get its database ID
    const semester = semesters.find((s) => s.id === semesterId);
    const course = semester?.courses.find((c) => c.id === courseId);

    if (!course) {
      console.error("Course not found for completion toggle");
      return;
    }

    console.log("Course found for completion toggle:", {
      courseId,
      databaseId: course.id,
      course,
    });

    // Update local state immediately for better UX
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

    // Persist to backend
    try {
      // The course.id is already the correct database ID, just convert string to number
      const courseDbId = Number(course.id);

      if (courseDbId && !isNaN(courseDbId)) {
        await toggleSemesterCourseCompletion(courseDbId);
        console.log(
          `Successfully toggled completion for course ${courseId} (DB ID: ${courseDbId})`
        );
      } else {
        console.warn(
          "Could not determine database ID for course completion toggle:",
          { courseId: course.id, course }
        );
      }
    } catch (error) {
      console.error("Failed to persist course completion to backend:", error);

      // Revert local state if backend call fails
      setSemesters(
        semesters.map((semester) =>
          semester.id === semesterId
            ? {
                ...semester,
                courses: semester.courses.map((course) =>
                  course.id === courseId
                    ? { ...course, completed: !course.completed } // Revert the change
                    : course
                ),
              }
            : semester
        )
      );
    }
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
              Created: {new Date(studyPlan.createDate).toLocaleDateString()}
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

        {/* Study Program Information */}
        {studyProgram && (
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
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  Degree Type
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {studyProgram.degreeType}
                </Typography>

                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  Total Credits Required
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {studyProgram.totalCredits} ECTS
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  Duration
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {studyProgram.semesterDuration} Semesters
                </Typography>

                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  Program ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {studyProgram.id}
                </Typography>
              </Grid>
              {studyProgram.description && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {studyProgram.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

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
