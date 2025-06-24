import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Info,
  ArrowBack,
  Edit,
  Delete,
} from "@mui/icons-material";

interface StudyPlanDetailPageProps {}

// Mock interfaces - replace with real data later
interface Course {
  name: string;
  category: string;
  credits: number;
}

interface Semester {
  number: number;
  courses: Course[];
  totalCredits: number;
}

const StudyPlanDetailPage: React.FC<StudyPlanDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for the specific study plan
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock function to fetch study plan by ID - replace with real API call
  const fetchStudyPlanById = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call to GET /api/v1/study-plans/{id}
      // const response = await getStudyPlanById(planId);

      // Mock data for now - customize based on the ID
      const mockStudyPlan = {
        id: planId,
        name: `My Study Plan ${planId}`,
        studyProgramName: "M.Sc. Information Systems",
        userId: 123,
        isActive: true,
        createdDate: "2024-01-15",
        lastModified: "2024-02-20",
        totalCredits: 120,
        completedCredits: 40,
        plannedCredits: 78,
        semesters: [
          {
            number: 1,
            courses: [
              {
                name: "Advanced Algorithms",
                category: "Algorithmen",
                credits: 6,
              },
              {
                name: "Database Systems",
                category: "Informationssysteme",
                credits: 6,
              },
              { name: "Machine Learning", category: "Algorithmen", credits: 6 },
              {
                name: "Software Engineering",
                category: "Praktische Informatik",
                credits: 6,
              },
              { name: "Statistics", category: "Mathematik", credits: 6 },
            ],
            totalCredits: 30,
          },
          {
            number: 2,
            courses: [
              { name: "Deep Learning", category: "Algorithmen", credits: 6 },
              {
                name: "Distributed Systems",
                category: "Informationssysteme",
                credits: 6,
              },
              { name: "Computer Vision", category: "Algorithmen", credits: 6 },
              {
                name: "Business Intelligence",
                category: "Informationssysteme",
                credits: 6,
              },
            ],
            totalCredits: 24,
          },
          {
            number: 3,
            courses: [
              {
                name: "Natural Language Processing",
                category: "Algorithmen",
                credits: 6,
              },
              {
                name: "Cloud Computing",
                category: "Informationssysteme",
                credits: 6,
              },
              {
                name: "Data Visualization",
                category: "Informationssysteme",
                credits: 6,
              },
              { name: "Seminar", category: "Seminar", credits: 6 },
            ],
            totalCredits: 24,
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStudyPlan(mockStudyPlan);
    } catch (err) {
      console.error("Error fetching study plan:", err);
      setError("Failed to load study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudyPlanById(id);
    }
  }, [id]);

  // Progress circle component
  const ProgressCircle = ({
    current,
    total,
    label,
  }: {
    current: number;
    total: number;
    label: string;
  }) => (
    <Box sx={{ textAlign: "center", minWidth: 120 }}>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `conic-gradient(#646cff ${
            (current / total) * 360
          }deg, #333 0deg)`,
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {current}/{total}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: "white", fontSize: "11px" }}>
        {label}
      </Typography>
    </Box>
  );

  const handleBack = () => {
    navigate("/study-plans");
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log("Edit study plan:", id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete study plan:", id);
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
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, color: "white" }}>
          <Link
            color="inherit"
            onClick={handleBack}
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Study Plans
          </Link>
          <Typography color="white">{studyPlan.name}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {studyPlan.name}
            </Typography>
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              {studyPlan.studyProgramName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Last modified:{" "}
              {new Date(studyPlan.lastModified).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={handleBack} sx={{ color: "white" }}>
              <ArrowBack />
            </IconButton>
            <IconButton onClick={handleEdit} sx={{ color: "white" }}>
              <Edit />
            </IconButton>
            <IconButton onClick={handleDelete} sx={{ color: "#ff6b6b" }}>
              <Delete />
            </IconButton>
            <Chip
              label={studyPlan.isActive ? "Active" : "Inactive"}
              sx={{
                backgroundColor: studyPlan.isActive ? "#4caf50" : "#333",
                color: "white",
                border: `1px solid ${studyPlan.isActive ? "#4caf50" : "#555"}`,
              }}
            />
          </Box>
        </Box>

        {/* Progress Bars */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ExpandMore sx={{ mr: 1 }} />
              <Typography variant="body2">Completed Progress</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ mr: 2, minWidth: 20 }}>
                {studyPlan.completedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  (studyPlan.completedCredits / studyPlan.totalCredits) * 100
                }
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#4caf50",
                  },
                }}
              />
              <Typography variant="caption" sx={{ ml: 2, minWidth: 30 }}>
                {studyPlan.totalCredits}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ExpandLess sx={{ mr: 1 }} />
              <Typography variant="body2">Planned Progress</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ mr: 2, minWidth: 20 }}>
                {studyPlan.plannedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  (studyPlan.plannedCredits / studyPlan.totalCredits) * 100
                }
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#646cff",
                  },
                }}
              />
              <Typography variant="caption" sx={{ ml: 2, minWidth: 30 }}>
                {studyPlan.totalCredits}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Circles - Mock categories */}
        <Box sx={{ display: "flex", gap: 4, mb: 4, justifyContent: "center" }}>
          <ProgressCircle current={12} total={18} label="Algorithms" />
          <ProgressCircle current={8} total={12} label="Info Systems" />
          <ProgressCircle current={6} total={6} label="Mathematics" />
          <ProgressCircle current={4} total={8} label="Seminars" />
          <ProgressCircle current={10} total={15} label="Electives" />
        </Box>

        {/* Semesters */}
        <Box>
          {studyPlan.semesters.map((semester: Semester) => (
            <Accordion
              key={semester.number}
              defaultExpanded
              sx={{
                backgroundColor: "#2a2a2a",
                color: "white",
                mb: 2,
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "white" }} />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                }}
              >
                <Typography variant="h6">
                  {semester.number}. Semester
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    {semester.totalCredits} Credits
                  </Typography>
                  <IconButton size="small" sx={{ color: "white" }}>
                    <Info fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer
                  component={Paper}
                  sx={{ backgroundColor: "#333" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "white",
                            borderBottom: "1px solid #555",
                          }}
                        >
                          Course
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            borderBottom: "1px solid #555",
                          }}
                        >
                          Category
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "white",
                            borderBottom: "1px solid #555",
                          }}
                        >
                          Credits
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {semester.courses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell
                            sx={{
                              color: "white",
                              borderBottom: "1px solid #555",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ExpandMore sx={{ mr: 1, fontSize: 16 }} />
                              {course.name}
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderBottom: "1px solid #555",
                            }}
                          >
                            <Chip
                              label={course.category}
                              size="small"
                              sx={{
                                backgroundColor: "#555",
                                color: "white",
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "white",
                              borderBottom: "1px solid #555",
                            }}
                          >
                            {course.credits}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Footer Info */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <IconButton sx={{ color: "#666" }}>
            <Info />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default StudyPlanDetailPage;
