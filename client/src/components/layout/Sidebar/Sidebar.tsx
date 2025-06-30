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
  Divider,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Add,
  Refresh,
  MoreHoriz,
  Delete,
  Edit,
  MenuBook,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMyStudyPlans,
  getStudyPrograms,
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
  const [creatingPlan, setCreatingPlan] = useState(false);

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

  // Fetch study programs for the dropdown
  const fetchStudyPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const programs = await getStudyPrograms();
      setStudyPrograms(programs);

      // Auto-select if there's only one program available
      if (programs.length === 1) {
        setSelectedProgramId(programs[0].id);
      } else {
        setSelectedProgramId(programs[0].id);
      }
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
      setCreatingPlan(true);
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
    } finally {
      setCreatingPlan(false);
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

  const isCurriculumActive = () => {
    return location.pathname === "/curriculum";
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
      {/* Main Navigation Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Curriculum
        </Typography>
        <List sx={{ pt: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              disableRipple
              onClick={() => navigate("/curriculum")}
              selected={isCurriculumActive()}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(100, 108, 255, 0.2)",
                  "& .MuiListItemIcon-root": { color: "#646cff" },
                  "& .MuiListItemText-primary": {
                    color: "#646cff",
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                <MenuBook />
              </ListItemIcon>
              <ListItemText
                primary="M.Sc. Information Systems"
                primaryTypographyProps={{
                  variant: "body2",
                  sx: {
                    fontWeight: 500,
                    color: "white",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Typography
          variant="caption"
          sx={{
            fontStyle: "italic",
            px: 2,
            pb: 1,
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          More curriculums coming soon
        </Typography>
      </Box>
      <Divider sx={{ mx: 2, borderColor: "rgba(100, 108, 255, 0.2)" }} />
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

          {/* Create Study Plan Modal */}
          <Dialog
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: "rgba(42, 42, 42, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(100, 108, 255, 0.2)",
                borderRadius: 4,
                color: "white",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(135deg, rgba(100, 108, 255, 0.05) 0%, transparent 100%)",
                  zIndex: -1,
                },
              },
            }}
            BackdropProps={{
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
              },
            }}
          >
            <DialogTitle
              sx={{
                color: "white",
                borderBottom: "1px solid rgba(100, 108, 255, 0.2)",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #646cff 50%, #ffffff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create New Study Plan
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <TextField
                autoFocus
                margin="dense"
                placeholder="Study Plan Name"
                fullWidth
                variant="outlined"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 3,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(100, 108, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#646cff",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "white",
                    fontSize: "1.1rem",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#aaa",
                    "&.Mui-focused": {
                      color: "#646cff",
                    },
                  },
                }}
              />
              <FormControl fullWidth variant="outlined">
                <Select
                  value={selectedProgramId}
                  onChange={handleProgramChange}
                  disabled={loadingPrograms}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 3,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(100, 108, 255, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                      borderWidth: "2px",
                    },
                    "& .MuiSelect-select": {
                      color: "white",
                      fontSize: "1.1rem",
                    },
                    "& .MuiSvgIcon-root": { color: "#aaa" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(42, 42, 42, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(100, 108, 255, 0.2)",
                        borderRadius: 3,
                        "& .MuiMenuItem-root": {
                          color: "white",
                          fontSize: "1rem",
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
            <DialogActions
              sx={{ p: 3, borderTop: "1px solid rgba(100, 108, 255, 0.2)" }}
            >
              <Button
                onClick={() => setCreateModalOpen(false)}
                disabled={creatingPlan}
                sx={{
                  color: "#aaa",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStudyPlan}
                variant="contained"
                disabled={
                  !newPlanName.trim() || !selectedProgramId || creatingPlan
                }
                sx={{
                  background:
                    "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  borderRadius: "50px",
                  fontWeight: 600,
                  boxShadow: "0 8px 32px rgba(100, 108, 255, 0.4)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(100, 108, 255, 0.6)",
                  },
                  "&:disabled": {
                    background: "rgba(100, 108, 255, 0.3)",
                    transform: "none",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {creatingPlan ? "Creating..." : "Create"}
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
