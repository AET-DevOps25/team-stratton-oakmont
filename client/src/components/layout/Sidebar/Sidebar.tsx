import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Description, Add, Refresh } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyStudyPlans, StudyPlanApiError } from "../../../api/studyPlans";
import type { StudyPlanDto } from "../../../api/studyPlans";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for study plans (combining hook logic here)
  const [studyPlans, setStudyPlans] = useState<StudyPlanDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [studyPrograms, setStudyPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Fetch study plans function
  const fetchStudyPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await getMyStudyPlans();
      setStudyPlans(plans);
    } catch (err) {
      console.error("Error fetching study plans:", err);

      if (err instanceof StudyPlanApiError) {
        // Handle specific API errors
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to view study plans."
          );
        } else {
          setError(err.message);
        }
      } else {
        // Handle other errors
        setError("Failed to load study plans. Please try again.");
      }

      // Clear study plans on error
      setStudyPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch study plans on component mount
  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const handleStudyPlanClick = (studyPlanId: number) => {
    // Navigate to study plan detail page
    navigate(`/study-plans/${studyPlanId}`);
  };

  const handleRefresh = () => {
    fetchStudyPlans();
  };

  const isStudyPlanActive = (studyPlanId: number) => {
    return location.pathname === `/study-plans/${studyPlanId}`;
  };

  const sidebarWidth = 260;

  // Fetch study programs for the dropdown
  const fetchStudyPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await fetch(
        "http://localhost:8081/api/v1/study-programs",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const programs = await response.json();
        setStudyPrograms(programs);
      }
    } catch (error) {
      console.error("Error fetching study programs:", error);
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
      const token = localStorage.getItem("jwtToken");
      const response = await fetch("http://localhost:8081/api/v1/study-plans", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlanName.trim(),
          studyProgramId: selectedProgramId,
        }),
      });

      if (response.ok) {
        // Close modal and reset form
        setCreateModalOpen(false);
        setNewPlanName("");
        setSelectedProgramId("");
        // Refresh study plans list
        fetchStudyPlans();
      } else {
        console.error("Failed to create study plan");
      }
    } catch (error) {
      console.error("Error creating study plan:", error);
    }
  };

  // Open modal and fetch programs
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    fetchStudyPrograms();
  };

  // Handle program selection
  const handleProgramChange = (event: SelectChangeEvent<number>) => {
    setSelectedProgramId(event.target.value as number);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #ddd",
        },
      }}
    >
      <Toolbar /> {/* Space for navbar */}
      {/* Study Plans Section */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          My Study Plans
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Create new study plan">
            <IconButton
              size="small"
              onClick={handleOpenCreateModal}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(100, 108, 255, 0.04)" },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh study plans">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}
      {/* Error State */}
      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert
            severity="error"
            sx={{
              fontSize: "0.75rem",
              "& .MuiAlert-message": { fontSize: "0.75rem" },
            }}
            action={
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{ color: "inherit" }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Box>
      )}
      {/* Study Plans List */}
      {!loading && !error && (
        <List sx={{ pt: 0 }}>
          {studyPlans.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", px: 1 }}
                  >
                    No study plans found
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            studyPlans.map((plan) => (
              <ListItem key={plan.id} disablePadding>
                {/* <Tooltip title={`Open ${plan.name} - ${plan.studyProgramName || 'No program'}`}> */}
                <ListItemButton
                  onClick={() => handleStudyPlanClick(plan.id)}
                  selected={isStudyPlanActive(plan.id)}
                  sx={{
                    pl: 3, // Indent to show hierarchy
                    minHeight: 48,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(100, 108, 255, 0.12)",
                      borderRight: "3px solid #646cff",
                      "& .MuiListItemIcon-root": { color: "#646cff" },
                      "& .MuiListItemText-primary": {
                        color: "#646cff",
                        fontWeight: 600,
                      },
                      "& .MuiListItemText-secondary": {
                        color: "rgba(100, 108, 255, 0.7)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <Description fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={plan.name}
                    secondary={plan.studyProgramName || "No program"}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: {
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      sx: {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                </ListItemButton>
                {/* </Tooltip> */}
              </ListItem>
            ))
          )}

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
        </List>
      )}
    </Drawer>
  );
};

export default Sidebar;
