import React, { useState, useEffect } from "react";
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
  Paper,
  Chip,
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
import {
  School,
  AutoStories,
  Psychology,
  TrendingUp,
  Rocket,
  Star,
  Code,
  Analytics,
  Speed,
} from "@mui/icons-material";

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

  // Animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  const floatingElements = Array.from({ length: 20 }, (_, i) => i);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(100, 108, 255, 0.1) 0%, transparent 50%)`,
          transition: "background 0.3s ease",
        }}
      />

      {/* Floating Particles */}
      {floatingElements.map((i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            backgroundColor: "rgba(100, 108, 255, 0.3)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0px) rotate(0deg)",
                opacity: 0.3,
              },
              "50%": {
                transform: `translateY(${Math.random() * 20 - 10}px) rotate(180deg)`,
                opacity: 0.8,
              },
            },
          }}
        />
      ))}

      {/* Grid Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(100, 108, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(100, 108, 255, 0.1) 0%, transparent 50%),
            linear-gradient(90deg, rgba(100, 108, 255, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(100, 108, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 50px 50px, 50px 50px",
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 12,
            pt: 8,
          }}
        >
          <Box
            sx={{
              display: "inline-block",
              mb: 3,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "120%",
                height: "120%",
                background: "linear-gradient(45deg, transparent, rgba(100, 108, 255, 0.1), transparent)",
                borderRadius: "50%",
                animation: "pulse 4s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 0.3,
                  },
                  "50%": {
                    transform: "translate(-50%, -50%) scale(1.1)",
                    opacity: 0.6,
                  },
                },
              },
            }}
          >
            <School
              sx={{
                fontSize: "4rem",
                color: "#646cff",
                filter: "drop-shadow(0 0 20px rgba(100, 108, 255, 0.5))",
                animation: "glow 3s ease-in-out infinite alternate",
                "@keyframes glow": {
                  from: {
                    filter: "drop-shadow(0 0 20px rgba(100, 108, 255, 0.5))",
                  },
                  to: {
                    filter: "drop-shadow(0 0 30px rgba(100, 108, 255, 0.8))",
                  },
                },
              }}
            />
          </Box>

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "3rem", md: "5rem", lg: "6rem" },
              background: "linear-gradient(135deg, #ffffff 0%, #646cff 50%, #ffffff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "textShimmer 4s ease-in-out infinite",
              "@keyframes textShimmer": {
                "0%, 100%": {
                  backgroundPosition: "0% 50%",
                },
                "50%": {
                  backgroundPosition: "100% 50%",
                },
              },
              backgroundSize: "200% 200%",
              textShadow: "0 0 50px rgba(100, 108, 255, 0.3)",
            }}
          >
            TUM Study Planner
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 6,
              color: "#aaa",
              fontSize: { xs: "1.2rem", md: "1.8rem" },
              maxWidth: "900px",
              mx: "auto",
              lineHeight: 1.6,
              fontWeight: 300,
              animation: "fadeInUp 1s ease-out 0.5s both",
              "@keyframes fadeInUp": {
                from: {
                  opacity: 0,
                  transform: "translateY(30px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            Navigate your TUM studies effortlessly with an AI assistant that helps
            you choose courses, track requirements, and validate your academic plan.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
              mb: 6,
              animation: "fadeInUp 1s ease-out 1s both",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              startIcon={<Rocket />}
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                borderRadius: "50px",
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 8px 32px rgba(100, 108, 255, 0.4)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transition: "left 0.6s",
                },
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 16px 48px rgba(100, 108, 255, 0.6)",
                  "&::before": {
                    left: "100%",
                  },
                },
                transition: "all 0.3s ease",
              }}
            >
              {isLoggedIn ? "Create Study Plan" : "Get Started"}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/curriculum")}
              startIcon={<AutoStories />}
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                borderRadius: "50px",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#646cff",
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 32px rgba(100, 108, 255, 0.2)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Explore Curriculum
            </Button>
          </Box>

          {/* Stats */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              animation: "fadeInUp 1s ease-out 1.5s both",
            }}
          >
            {[
              { icon: Code, label: "Courses", value: "120+" },
              { icon: Analytics, label: "Study Plans", value: "50+" },
              { icon: Speed, label: "ECTS Credits", value: "120" },
            ].map((stat, index) => (
              <Box key={index} sx={{ textAlign: "center" }}>
                <stat.icon sx={{ fontSize: "2rem", color: "#646cff", mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Features Section */}
        <Paper
          sx={{
            p: 6,
            mb: 8,
            backgroundColor: "rgba(42, 42, 42, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(100, 108, 255, 0.2)",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              color: "white",
            }}
          >
            Why Choose TUM Study Planner?
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <School sx={{ fontSize: "3rem", color: "#646cff" }} />,
                title: "Smart Study Planning",
                description: "Create personalized study plans that adapt to your academic goals and track your progress in real-time.",
                color: "#646cff",
              },
              {
                icon: <Psychology sx={{ fontSize: "3rem", color: "#4caf50" }} />,
                title: "AI-Powered Guidance",
                description: "Get intelligent course recommendations and academic advice powered by advanced AI technology.",
                color: "#4caf50",
              },
              {
                icon: <TrendingUp sx={{ fontSize: "3rem", color: "#ff9800" }} />,
                title: "Progress Tracking",
                description: "Monitor your academic journey with detailed analytics and visualizations of your achievements.",
                color: "#ff9800",
              },
            ].map((feature, index) => (
              <Grid size={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    background: "rgba(30, 30, 30, 0.6)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${feature.color}20`,
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: `0 20px 40px ${feature.color}20`,
                      border: `1px solid ${feature.color}40`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 4 }}>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "white",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#aaa",
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(100, 108, 255, 0.05) 100%)",
            border: "1px solid rgba(100, 108, 255, 0.2)",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: "white",
            }}
          >
            Ready to Transform Your Studies?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: "#aaa",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Join thousands of students who are already using TUM Study Planner to
            optimize their academic journey.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip
              icon={<Star />}
              label="Free to Use"
              sx={{
                backgroundColor: "rgba(100, 108, 255, 0.2)",
                color: "#646cff",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<Speed />}
              label="Instant Setup"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#4caf50",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<Psychology />}
              label="AI Powered"
              sx={{
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                color: "#ff9800",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* Create Study Plan Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2a2a2a",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Create New Study Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Study Plan Name"
            fullWidth
            variant="outlined"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#646cff" },
                "&.Mui-focused fieldset": { borderColor: "#646cff" },
              },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "#aaa" },
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: "#aaa" }}>Study Program</InputLabel>
            <Select
              value={selectedProgramId}
              onChange={handleProgramChange}
              label="Study Program"
              disabled={loadingPrograms}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#646cff" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#646cff" },
                "& .MuiSelect-select": { color: "white" },
                "& .MuiSvgIcon-root": { color: "white" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#2a2a2a",
                    "& .MuiMenuItem-root": {
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(100, 108, 255, 0.1)",
                      },
                    },
                  },
                },
              }}
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
          <Button
            onClick={() => setCreateModalOpen(false)}
            sx={{ color: "#aaa" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStudyPlan}
            variant="contained"
            disabled={!newPlanName.trim() || !selectedProgramId}
            sx={{
              backgroundColor: "#646cff",
              "&:hover": { backgroundColor: "#535bf2" },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPage;