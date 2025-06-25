import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess
} from "@mui/icons-material";
import {
  getStudyPlanById,
  getStudyProgramById,
  StudyPlanApiError,
} from "../../api/studyPlans";
import type { StudyPlanDto, StudyProgramDto } from "../../api/studyPlans";

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

  const fetchStudyPlanById = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the actual API call
      const planResponse = await getStudyPlanById(planId);
      setStudyPlan(planResponse);

      // Fetch the study program if studyProgramId exists
      if (planResponse.studyProgramId) {
        try {
          const programResponse = await getStudyProgramById(
            planResponse.studyProgramId
          );
          setStudyProgram(programResponse);
        } catch (programErr) {
          console.warn("Could not fetch study program details:", programErr);
          // Continue without study program details
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
    // TODO: Find something better then this navigation
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

  // Calculate progress values - using study program data if available
  const totalCredits = studyProgram?.totalCredits || 120; // fallback value
  const completedCredits = 0; // TODO: Calculate from actual course data
  const plannedCredits = 0; // TODO: Calculate from actual course data

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

        {/* Study Program Information */}
        {studyProgram && (
          <Paper
            sx={{ p: 3, mb: 4, backgroundColor: "#2a2a2a", color: "white" }}
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

        {/* Progress Bars */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Progress Overview
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ExpandMore sx={{ mr: 1 }} />
              <Typography variant="body2">Completed Progress</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ mr: 2, minWidth: 20 }}>
                {completedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0
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
                {totalCredits}
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
                {plannedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  totalCredits > 0 ? (plannedCredits / totalCredits) * 100 : 0
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
                {totalCredits}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Study Plan Data */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: "#2a2a2a", color: "white" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Study Plan Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Status
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {studyPlan.isActive ? "Active" : "Inactive"}
              </Typography>

              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Created
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(studyPlan.createdDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                Plan ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {studyPlan.id}
              </Typography>

              <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                User ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {studyPlan.userId}
              </Typography>
            </Grid>

            {studyPlan.planData && (
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2, borderColor: "#555" }} />
                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  Plan Data
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#333",
                    p: 2,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {studyPlan.planData}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={handleEdit}>
            Edit Plan
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete Plan
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default StudyPlanDetailPage;
