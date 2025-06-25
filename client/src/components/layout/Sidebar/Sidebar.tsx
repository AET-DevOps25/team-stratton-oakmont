import React, { useState, useEffect, useRef } from "react";
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
  Menu,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Description,
  Add,
  Refresh,
  MoreVert,
  Delete,
  Edit,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMyStudyPlans,
  getStudyPrograms,
  createStudyPlan,
  StudyPlanApiError,
} from "../../../api/studyPlans";
import type {
  StudyPlanDto,
  CreateStudyPlanRequest,
} from "../../../api/studyPlans";
import { useStudyPlans } from "../../../contexts/StudyPlansContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    studyPlans,
    setStudyPlans,
    addStudyPlan,
    removeStudyPlan,
    updateStudyPlan,
  } = useStudyPlans();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [studyPrograms, setStudyPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingPlanName, setEditingPlanName] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);

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
      const programs = await getStudyPrograms();
      setStudyPrograms(programs);
    } catch (err) {
      console.error("Error fetching study programs:", err);

      if (err instanceof StudyPlanApiError) {
        // Handle specific API errors - you could show a toast notification here
        console.error("Failed to load study programs:", err.message);
      } else {
        console.error("Failed to load study programs. Please try again.");
      }

      // Set empty programs on error
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
    } catch (err) {
      console.error("Error creating study plan:", err);

      if (err instanceof StudyPlanApiError) {
        // Handle specific API errors - you could show a toast notification here
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to create study plans."
          );
        } else {
          console.error("Failed to create study plan:", err.message);
        }
      } else {
        console.error("Failed to create study plan. Please try again.");
      }
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

  // Add this after the handleProgramChange function
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    planId: number
  ) => {
    event.stopPropagation(); // Prevent navigation when clicking menu
    setMenuAnchorEl(event.currentTarget);
    setSelectedPlanId(planId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedPlanId(null);
  };

  const handleDeleteStudyPlan = async () => {
    if (!selectedPlanId) return;

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("Authentication failed. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:8081/api/v1/study-plans/${selectedPlanId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the deleted plan from local state instead of refetching
        removeStudyPlan(selectedPlanId);
        handleMenuClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete study plan");
      }
    } catch (err) {
      console.error("Error deleting study plan:", err);
      setError("Failed to delete study plan. Please try again.");
    }
  };

  const handleRenameClick = (plan: StudyPlanDto) => {
    setEditingPlanId(plan.id);
    setEditingPlanName(plan.name);
    handleMenuClose();

    // Use setTimeout to ensure the TextField is rendered before selecting text
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.select();
      }
    }, 0);
  };

  const handleRenameSubmit = async (planId: number) => {
    if (!editingPlanName.trim()) {
      setEditingPlanId(null);
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("Authentication failed. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:8081/api/v1/study-plans/${planId}/rename`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editingPlanName.trim() }),
        }
      );

      if (response.ok) {
        // Update local state instead of refetching
        updateStudyPlan(planId, { name: editingPlanName.trim() });
        setEditingPlanId(null);
        setEditingPlanName("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to rename study plan");
        setEditingPlanId(null);
        setEditingPlanName("");
      }
    } catch (err) {
      console.error("Error renaming study plan:", err);
      setError("Failed to rename study plan. Please try again.");
      setEditingPlanId(null);
      setEditingPlanName("");
    }
  };

  const handleRenameCancel = () => {
    setEditingPlanId(null);
    setEditingPlanName("");
  };

  const handleRenameKeyPress = (event: React.KeyboardEvent, planId: number) => {
    if (event.key === "Enter") {
      handleRenameSubmit(planId);
    } else if (event.key === "Escape") {
      handleRenameCancel();
    }
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
                  {editingPlanId === plan.id ? (
                    <TextField
                      inputRef={renameInputRef}
                      value={editingPlanName}
                      onChange={(e) => setEditingPlanName(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyPress(e, plan.id)}
                      autoFocus
                      fullWidth
                      variant="standard"
                      sx={{
                        "& .MuiInput-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInput-root:before": {
                          borderBottomColor: "primary.main",
                        },
                        "& .MuiInput-root:hover:before": {
                          borderBottomColor: "primary.main",
                        },
                        "& .MuiInput-root:after": {
                          borderBottomColor: "primary.main",
                        },
                      }}
                    />
                  ) : (
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
                  )}
                  {/* Three-dot menu button */}
                  <Box
                    sx={{
                      opacity: 0,
                      transition: "opacity 0.2s",
                      ".MuiListItemButton-root:hover &": {
                        opacity: 1,
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, plan.id)}
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.08)",
                        },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemButton>
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

          {/* Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={() => {
                const selectedPlan = studyPlans.find(
                  (p) => p.id === selectedPlanId
                );
                if (selectedPlan) handleRenameClick(selectedPlan);
              }}
              sx={{ color: "text.primary" }}
            >
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Rename
            </MenuItem>
            <MenuItem
              onClick={handleDeleteStudyPlan}
              sx={{ color: "error.main" }}
            >
              <Delete fontSize="small" sx={{ mr: 1 }} />
              Delete Study Plan
            </MenuItem>
          </Menu>
        </List>
      )}
    </Drawer>
  );
};

export default Sidebar;
