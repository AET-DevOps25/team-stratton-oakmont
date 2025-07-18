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
import { Search, Close } from "@mui/icons-material";
import { getStudyPrograms } from "../../api/studyPlans";
import type { StudyProgramDto } from "../../api/studyPlans";

// Study Program interface - now using backend structure
interface StudyProgram {
  id: number; // Changed from string to number
  name: string;
  degree: string; // Bachelor, Master, etc.
  fieldOfStudy: string;
  credits: number;
  semesters: number;
  description?: string;
  language: string;
  location: string;
  // Backend fields
  curriculum: string;
  fieldOfStudies: string;
  ectsCredits: number;
  semester: number;
  curriculumLink?: string;
}

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
  const [uniqueDegrees, setUniqueDegrees] = useState<string[]>([]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const studyProgramsData: StudyProgramDto[] = await getStudyPrograms();

      // Transform backend data to frontend format
      const transformedPrograms: StudyProgram[] = studyProgramsData.map(
        (program) => ({
          id: program.id,
          name: program.curriculum || program.name || "Unknown Program",
          degree: program.degree,
          fieldOfStudy:
            program.fieldOfStudies || program.fieldOfStudy || "Unknown Field",
          credits: program.ectsCredits || program.credits || 0,
          semesters: program.semester || program.semesters || 0,
          description:
            program.description ||
            `${program.degree} program in ${
              program.fieldOfStudies || "various fields"
            }`,
          language: program.language || "English",
          location: program.location || "Munich",
          // Keep backend fields
          curriculum: program.curriculum,
          fieldOfStudies: program.fieldOfStudies,
          ectsCredits: program.ectsCredits,
          semester: program.semester,
          curriculumLink: program.curriculumLink,
        })
      );

      setPrograms(transformedPrograms);
      setFilteredPrograms(transformedPrograms);

      // Update unique degrees
      const degrees = Array.from(
        new Set(transformedPrograms.map((program) => program.degree))
      );
      setUniqueDegrees(degrees);
    } catch (error) {
      console.error("Error fetching study programs:", error);
      // Fallback to empty array on error
      setPrograms([]);
      setFilteredPrograms([]);
      setUniqueDegrees([]);
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
          program.fieldOfStudy
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          program.description?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getDegreeColor = (degree: string) => {
    switch (degree) {
      case "Bachelor":
        return "#4caf50";
      case "Master":
        return "#646cff";
      case "PhD":
        return "#9c27b0";
      default:
        return "#757575";
    }
  };

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
    // Check if the click was on the checkbox
    const target = event.target as HTMLElement;
    if (target.closest('[role="checkbox"]')) {
      return; // Don't handle row click if checkbox was clicked
    }

    handleProgramSelect(program);
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

        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: "1px solid #444" }}>
          <TextField
            placeholder="Search study programs by name, degree, field of study, or description..."
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#aaa", mr: 1, alignSelf: "center" }}
            >
              Filter by degree:
            </Typography>
            {uniqueDegrees.map((degree) => (
              <Chip
                key={degree}
                label={degree}
                onClick={() => handleDegreeToggle(degree)}
                sx={{
                  backgroundColor: selectedDegrees.includes(degree)
                    ? getDegreeColor(degree)
                    : "#555",
                  color: "white",
                  border: selectedDegrees.includes(degree)
                    ? `2px solid ${getDegreeColor(degree)}`
                    : "2px solid transparent",
                  "&:hover": {
                    backgroundColor: selectedDegrees.includes(degree)
                      ? getDegreeColor(degree)
                      : "#666",
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
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
          <TableContainer sx={{ maxHeight: "50vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
                      width: "50px",
                    }}
                  >
                    Select
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#333",
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
                    <TableCell sx={{ color: "white", width: "50px" }}>
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
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={program.degree}
                        size="small"
                        sx={{
                          backgroundColor: getDegreeColor(program.degree),
                          color: "white",
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {program.name}
                      </Typography>
                      {program.description && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#aaa", display: "block", mt: 0.5 }}
                        >
                          {program.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {program.fieldOfStudy}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {program.credits}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {program.semesters}
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
