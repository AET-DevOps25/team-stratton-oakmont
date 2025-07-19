import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { Search, Close, Info } from "@mui/icons-material";
import {
  getAllStudyPrograms,
  StudyProgramApiError,
} from "../../api/studyPrograms";
import type { StudyProgram } from "../../api/studyPrograms";

interface StudyProgramSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateStudyPlan: (studyPlanName: string, program: StudyProgram) => void;
  title?: string;
}

const StudyProgramSelectionDialog: React.FC<
  StudyProgramSelectionDialogProps
> = ({ open, onClose, onCreateStudyPlan, title = "Create New Study Plan" }) => {
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<StudyProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderBy, setOrderBy] = useState<keyof StudyProgram>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [studyPlanName, setStudyPlanName] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<StudyProgram | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);

  // Get unique degrees from programs
  const uniqueDegrees = Array.from(
    new Set(programs.map((program) => program.degree))
  );

  // Function to clean degree text by removing leading numbers
  const cleanDegreeText = (degree: string): string => {
    return degree.replace(/^\d+\s*/, "").trim();
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError("");
      const studyPrograms = await getAllStudyPrograms();
      setPrograms(studyPrograms);
      setFilteredPrograms(studyPrograms);
    } catch (error) {
      console.error("Error fetching study programs:", error);
      if (error instanceof StudyProgramApiError) {
        setError(`Failed to fetch study programs: ${error.message}`);
      } else {
        setError("An unexpected error occurred while fetching study programs");
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPrograms();
    }
  }, [open]);

  // Filter logic
  useEffect(() => {
    let filtered = programs;

    if (searchQuery) {
      filtered = filtered.filter(
        (program) =>
          program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply degree filter
    if (selectedDegrees.length > 0) {
      filtered = filtered.filter((program) =>
        selectedDegrees.includes(program.degree)
      );
    }

    setFilteredPrograms(filtered);
  }, [programs, searchQuery, selectedDegrees]);

  const handleSort = (property: keyof StudyProgram) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedPrograms = filteredPrograms.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleDegreeToggle = (degree: string) => {
    setSelectedDegrees((prev) =>
      prev.includes(degree)
        ? prev.filter((d) => d !== degree)
        : [...prev, degree]
    );
  };

  const handleProgramSelect = (program: StudyProgram) => {
    setSelectedProgram(program);
  };

  const handleRowClick = (program: StudyProgram, event: React.MouseEvent) => {
    // Check if the click was on the checkbox or info button
    const target = event.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || target.closest("button")) {
      return; // Don't handle row click if checkbox or button was clicked
    }

    handleProgramSelect(program);
  };

  const handleOpenCurriculum = (event: React.MouseEvent) => {
    event.stopPropagation();
    window.open("/curriculum", "_blank");
  };

  const handleCreateStudyPlan = () => {
    if (studyPlanName.trim() && selectedProgram) {
      onCreateStudyPlan(studyPlanName.trim(), selectedProgram);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedDegrees([]);
    setStudyPlanName("");
    setSelectedProgram(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#2a2a2a",
          color: "white",
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #444",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={handleClose} sx={{ color: "#aaa" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Study Plan Name Input */}
        <Box sx={{ p: 3, borderBottom: "1px solid #444" }}>
          <TextField
            placeholder="Study Plan Name"
            value={studyPlanName}
            onChange={(e) => setStudyPlanName(e.target.value)}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#333",
                borderRadius: 3,
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#646cff" },
                "&.Mui-focused fieldset": { borderColor: "#646cff" },
              },
              "& .MuiInputBase-input": { color: "white" },
            }}
          />
        </Box>

        {/* Error Alert */}
        {showError && error && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "#4a1f1f",
              borderBottom: "1px solid #444",
            }}
          >
            <Typography variant="body2" sx={{ color: "#ff6b6b", mb: 1 }}>
              ⚠️ {error}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                onClick={fetchPrograms}
                disabled={loading}
                sx={{ color: "#646cff", textTransform: "none" }}
              >
                Retry
              </Button>
              <Button
                size="small"
                onClick={() => setShowError(false)}
                sx={{ color: "#ff6b6b", textTransform: "none" }}
              >
                Dismiss
              </Button>
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: "1px solid #444" }}>
          <TextField
            placeholder="Search study programs by name, degree, or field of study..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#aaa" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "100%",
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#333",
                borderRadius: 3,
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#646cff" },
                "&.Mui-focused fieldset": { borderColor: "#646cff" },
              },
              "& .MuiInputBase-input": { color: "white" },
            }}
          />

          {/* Degree Filter Chips */}
          <Box>
            <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
              Filter by degree:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                paddingBottom: 1,
                "&::-webkit-scrollbar": {
                  height: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#333",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#666",
                  borderRadius: "3px",
                  "&:hover": {
                    backgroundColor: "#777",
                  },
                },
              }}
            >
              {uniqueDegrees.map((degree) => (
                <Chip
                  key={degree}
                  label={cleanDegreeText(degree)}
                  onClick={() => handleDegreeToggle(degree)}
                  sx={{
                    backgroundColor: selectedDegrees.includes(degree)
                      ? "#646cff"
                      : "#555",
                    color: "white",
                    border: selectedDegrees.includes(degree)
                      ? "2px solid #646cff"
                      : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: selectedDegrees.includes(degree)
                        ? "#5a5acf"
                        : "#666",
                    },
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Study Programs Table */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <CircularProgress sx={{ color: "#646cff" }} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "50vh", overflowX: "hidden" }}>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "60px",
                    }}
                  >
                    Select
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "120px",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "degree"}
                      direction={orderBy === "degree" ? order : "asc"}
                      onClick={() => handleSort("degree")}
                      sx={{ color: "white !important" }}
                    >
                      Degree
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "35%",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                      sx={{ color: "white !important" }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "25%",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "fieldOfStudy"}
                      direction={orderBy === "fieldOfStudy" ? order : "asc"}
                      onClick={() => handleSort("fieldOfStudy")}
                      sx={{ color: "white !important" }}
                    >
                      Field of Study
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "80px",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "credits"}
                      direction={orderBy === "credits" ? order : "asc"}
                      onClick={() => handleSort("credits")}
                      sx={{ color: "white !important" }}
                    >
                      Credits
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "90px",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "semesters"}
                      direction={orderBy === "semesters" ? order : "asc"}
                      onClick={() => handleSort("semesters")}
                      sx={{ color: "white !important" }}
                    >
                      Semesters
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "60px",
                    }}
                  >
                    Info
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPrograms.map((program) => (
                  <TableRow
                    key={program.id}
                    sx={{
                      "&:hover": { backgroundColor: "#333" },
                      borderBottom: "1px solid #444",
                      cursor: "pointer",
                      backgroundColor:
                        selectedProgram?.id === program.id
                          ? "#404040"
                          : "transparent",
                      border:
                        selectedProgram?.id === program.id
                          ? "2px solid #646cff"
                          : "none",
                    }}
                    onClick={(event) => handleRowClick(program, event)}
                  >
                    <TableCell sx={{ color: "white", width: "60px" }}>
                      <Checkbox
                        checked={selectedProgram?.id === program.id}
                        onChange={() => handleProgramSelect(program)}
                        sx={{
                          color: "#646cff",
                          "&.Mui-checked": {
                            color: "#646cff",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "120px" }}>
                      <Chip
                        label={cleanDegreeText(program.degree)}
                        size="small"
                        sx={{
                          backgroundColor: "#646cff",
                          color: "white",
                          fontSize: "0.7rem",
                          maxWidth: "100%",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "35%" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          wordBreak: "break-word",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.2,
                        }}
                        title={program.name}
                      >
                        {program.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "25%" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: "break-word",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.2,
                        }}
                        title={program.fieldOfStudy}
                      >
                        {program.fieldOfStudy}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "80px", textAlign: "center" }}>
                      {program.credits}
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "90px", textAlign: "center" }}>
                      {program.semesters}
                    </TableCell>
                    <TableCell sx={{ color: "white", width: "60px" }}>
                      <IconButton
                        onClick={handleOpenCurriculum}
                        sx={{
                          color: "#646cff",
                          "&:hover": {
                            backgroundColor: "rgba(100, 108, 255, 0.1)",
                          },
                        }}
                      >
                        <Info />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {sortedPrograms.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              No study programs found
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid #444",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={handleClose}
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
          disabled={!studyPlanName.trim() || !selectedProgram}
          sx={{
            backgroundColor:
              studyPlanName.trim() && selectedProgram ? "#646cff" : "#555",
            color: "white",
            textTransform: "none",
            "&:hover": {
              backgroundColor:
                studyPlanName.trim() && selectedProgram ? "#5a5acf" : "#555",
            },
            "&:disabled": {
              backgroundColor: "#555",
              color: "#999",
            },
          }}
        >
          Create Study Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudyProgramSelectionDialog;
