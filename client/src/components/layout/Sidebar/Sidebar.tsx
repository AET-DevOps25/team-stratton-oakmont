import React, { useState, useEffect, useRef } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { Add, Refresh, MoreHoriz, Delete, Edit } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMyStudyPlans,
  createStudyPlan,
  deleteStudyPlan,
  renameStudyPlan,
  StudyPlanApiError,
} from "../../../api/studyPlans";
import type {
  StudyPlanDto,
  CreateStudyPlanRequest,
} from "../../../api/studyPlans";
import { useStudyPlans } from "../../../contexts/StudyPlansContext";
import StudyProgramSelectionDialog from "../../ui/StudyProgramSelectionDialog";

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
    // Prevent navigation if currently editing this plan
    if (editingPlanId === studyPlanId) {
      return;
    }
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

  // Handle creating study plan with the new dialog
  const handleCreateStudyPlan = async (studyPlanName: string, program: any) => {
    try {
      // Use the real program ID from the StudyProgramSelectionDialog
      const studyProgramId = program.id;

      const request: CreateStudyPlanRequest = {
        name: studyPlanName,
        studyProgramId: studyProgramId,
      };

      const newPlan = await createStudyPlan(request);
      addStudyPlan(newPlan);

      // Navigate to the newly created study plan
      navigate(`/study-plans/${newPlan.id}`);
    } catch (err) {
      console.error("Error creating study plan:", err);

      if (err instanceof StudyPlanApiError) {
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to create study plans."
          );
        } else {
          setError(`Failed to create study plan: ${err.message}`);
        }
      } else {
        setError("Failed to create study plan. Please try again.");
      }
    }
  };

  // Open modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
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
      await deleteStudyPlan(selectedPlanId);
      // Remove the deleted plan from local state instead of refetching
      removeStudyPlan(selectedPlanId);
      handleMenuClose();
    } catch (err) {
      console.error("Error deleting study plan:", err);

      if (err instanceof StudyPlanApiError) {
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to delete this study plan."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to delete study plan. Please try again.");
      }
    }
  };

  const handleRenameClick = (plan: StudyPlanDto) => {
    setEditingPlanId(plan.id);
    setEditingPlanName(plan.name);
    handleMenuClose();

    // Navigate to the study plan immediately when starting to rename
    navigate(`/study-plans/${plan.id}`);

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
      const updatedPlan = await renameStudyPlan(planId, editingPlanName.trim());
      // Update local state instead of refetching
      updateStudyPlan(planId, { name: updatedPlan.name });
      setEditingPlanId(null);
      setEditingPlanName("");
    } catch (err) {
      console.error("Error renaming study plan:", err);

      if (err instanceof StudyPlanApiError) {
        if (err.statusCode === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.statusCode === 403) {
          setError(
            "Access denied. You don't have permission to rename this study plan."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to rename study plan. Please try again.");
      }

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
          backgroundColor: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(100, 108, 255, 0.2)",
          color: "white",
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
          sx={{
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          My Study Plans
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Create new study plan">
            <IconButton
              size="small"
              onClick={handleOpenCreateModal}
              sx={{
                color: "#646cff",
                "&:hover": {
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                  color: "#646cff",
                },
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
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  color: "#646cff",
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                },
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
          <CircularProgress size={20} sx={{ color: "#646cff" }} />
        </Box>
      )}
      {/* Error State */}
      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert
            severity="error"
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: "#ff6b6b",
              border: "1px solid rgba(244, 67, 54, 0.2)",
              "& .MuiAlert-message": { fontSize: "0.75rem" },
              "& .MuiAlert-icon": { color: "#ff6b6b" },
            }}
            action={
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{ color: "#ff6b6b" }}
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
                    sx={{
                      fontStyle: "italic",
                      px: 1,
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
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
                  disableRipple
                  onClick={() => handleStudyPlanClick(plan.id)}
                  selected={isStudyPlanActive(plan.id)}
                  sx={{
                    pl: 3,
                    minHeight: 48,
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: "rgba(100, 108, 255, 0.1)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(100, 108, 255, 0.2)",
                      "& .MuiListItemText-primary": {
                        color: "#646cff",
                        fontWeight: 600,
                      },
                    },
                  }}
                >
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
                          color: "white",
                        },
                        "& .MuiInput-root:before": {
                          borderBottomColor: "#646cff",
                        },
                        "& .MuiInput-root:hover:before": {
                          borderBottomColor: "#646cff",
                        },
                        "& .MuiInput-root:after": {
                          borderBottomColor: "#646cff",
                        },
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={plan.name}
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: {
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "white",
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
                      disableRipple
                      size="small"
                      onClick={(e) => handleMenuOpen(e, plan.id)}
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          color: "#646cff",
                        },
                      }}
                    >
                      <MoreHoriz fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          )}

          {/* Study Program Selection Dialog */}
          <StudyProgramSelectionDialog
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onCreateStudyPlan={handleCreateStudyPlan}
          />

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
            PaperProps={{
              sx: {
                backgroundColor: "rgba(42, 42, 42, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                const selectedPlan = studyPlans.find(
                  (p) => p.id === selectedPlanId
                );
                if (selectedPlan) handleRenameClick(selectedPlan);
              }}
              sx={{
                color: "white",
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                },
              }}
            >
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Rename
            </MenuItem>
            <MenuItem
              onClick={handleDeleteStudyPlan}
              sx={{
                color: "#ff6b6b",
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                },
              }}
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
