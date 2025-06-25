import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getStudyPrograms,
  createStudyPlan,
  StudyPlanApiError,
} from "../../api/studyPlans";
import type {
  CreateStudyPlanRequest,
  StudyProgramDto,
} from "../../api/studyPlans";
import { useStudyPlans } from "../../contexts/StudyPlansContext";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // State for create study plan modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [studyPrograms, setStudyPrograms] = useState<StudyProgramDto[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const { addStudyPlan } = useStudyPlans();

  // Fetch study programs for the dropdown
  const fetchStudyPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const programs = await getStudyPrograms();
      setStudyPrograms(programs);
    } catch (err) {
      console.error("Error fetching study programs:", err);
      setStudyPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Create new study plan
  const handleCreateStudyPlan = async () => {
    if (!newPlanName.trim() || !selectedProgramId) {
      return;
    }

    try {
      const request: CreateStudyPlanRequest = {
        name: newPlanName.trim(),
        studyProgramId: selectedProgramId as number,
      };

      const newPlan = await createStudyPlan(request);
      addStudyPlan(newPlan);

      // Close modal and reset form
      setCreateModalOpen(false);
      setNewPlanName("");
      setSelectedProgramId("");

      // Navigate to the newly created study plan
      navigate(`/study-plans/${newPlan.id}`);
    } catch (err) {
      console.error("Error creating study plan:", err);

      if (err instanceof StudyPlanApiError) {
        if (err.statusCode === 401) {
          alert("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          alert(
            "Access denied. You don't have permission to create study plans."
          );
        } else {
          alert(`Failed to create study plan: ${err.message}`);
        }
      } else {
        alert("Failed to create study plan. Please try again.");
      }
    }
  };

  // Handle program selection
  const handleProgramChange = (event: SelectChangeEvent<number>) => {
    setSelectedProgramId(event.target.value as number);
  };

  // Open modal and fetch programs
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    fetchStudyPrograms();
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      handleOpenCreateModal();
    } else {
      navigate("/signup");
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "calc(100vh - 64px)",
        py: 8,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 8,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: "2.5rem", md: "4rem" },
            color: "#333",
          }}
        >
          TUM Study Planner
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: "#555",
            fontSize: { xs: "1.1rem", md: "1.5rem" },
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Navigate your TUM studies effortlessly with an AI assistant that helps
          you choose courses, track requirements, and validate your academic
          plan.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            borderRadius: "8px",
            backgroundColor: "#646cff",
            color: "white",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "0 4px 14px rgba(100, 108, 255, 0.25)",
            "&:hover": {
              backgroundColor: "#535bf2",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(100, 108, 255, 0.35)",
            },
            transition: "all 0.3s ease",
          }}
        >
          {isLoggedIn ? "Create Study Plan" : "Get Started"}
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: "#333",
                }}
              >
                Study Plan
              </Typography>
              <Box
                sx={{
                  height: "200px",
                  backgroundColor: "#ffffff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  border: "1px solid #ddd",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    fontStyle: "italic",
                  }}
                >
                  &lt;TBD: Preview Study Plan&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: "#333",
                }}
              >
                Course Selection
              </Typography>
              <Box
                sx={{
                  height: "200px",
                  backgroundColor: "#ffffff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  border: "1px solid #ddd",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    fontStyle: "italic",
                  }}
                >
                  &lt;TBD: Preview Course Selection&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: "#333",
                }}
              >
                AI Assistant
              </Typography>
              <Box
                sx={{
                  height: "200px",
                  backgroundColor: "#ffffff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  border: "1px solid #ddd",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    fontStyle: "italic",
                  }}
                >
                  &lt;TBD: Preview AI Assistant&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Study Plan Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Study Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Study Plan Name"
            fullWidth
            variant="outlined"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Study Program</InputLabel>
            <Select
              value={selectedProgramId}
              onChange={handleProgramChange}
              label="Study Program"
              disabled={loadingPrograms}
            >
              {studyPrograms.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name} ({program.degreeType})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateStudyPlan}
            variant="contained"
            disabled={!newPlanName.trim() || !selectedProgramId}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandingPage;
